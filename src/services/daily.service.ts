import axios, { AxiosInstance } from "axios";

export interface DailyRoomConfig {
  name?: string;
  privacy?: "public" | "private";
  properties?: {
    max_participants?: number; // pay as you go feature
    start_audio_off?: boolean;
    start_video_off?: boolean;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    enable_prejoin_ui?: boolean;
    enable_network_ui?: boolean;
    enable_screenshare?: boolean;
    enable_recording?: "local" | "cloud" | "raw-tracks";
    recording_layout?: object;
    exp?: number; // Room expiration time (Unix timestamp)
    eject_after_elapsed?: number; // Auto-eject after seconds
    eject_at_room_exp?: boolean;
    lang?: string;
  };
}

export interface DailyRoom {
  id: string;
  name: string;
  api_created: boolean;
  privacy: "public" | "private";
  url: string;
  created_at: string;
  config: DailyRoomConfig["properties"];
}

export interface DailyMeetingToken {
  token: string;
  room_name: string;
  user_id: string;
  user_name: string;
  expires: number;
  is_owner: boolean;
}

export interface DailyRecordingResponse {
  id: string;
  room_name: string;
  status: "finished" | "in-progress" | "failed";
  max_participants: number;
  duration: number;
  start_ts: number;
  end_ts?: number;
  download_link?: string;
  share_token?: string;
}

export class DailyService {
  private client: AxiosInstance;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.DAILY_API_KEY;
    if (!this.apiKey) {
      throw new Error("Missing Daily API key in environment variables");
    }

    this.client = axios.create({
      baseURL: "https://api.daily.co/v1",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }
  /**
   * Create a new Daily room
   */
  async createRoom(config: DailyRoomConfig): Promise<DailyRoom> {
    let roomName = config.name;
    try {
      const response = await this.client.post<DailyRoom>("/rooms", config, {
        timeout: 30000,
      });
      return response.data;
    } catch (error: any) {
      // Axios timeout or network error
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        console.error(
          "Timeout or network error creating Daily room, checking if room exists...",
          error
        );
        if (roomName) {
          try {
            const existingRoom = await this.getRoom(roomName);
            if (existingRoom) {
              console.warn(
                "Room was created despite timeout, returning existing room."
              );
              return existingRoom;
            }
          } catch (fetchErr) {
            console.error("Room not found after timeout:", fetchErr);
          }
        }
        throw new Error("Failed to create video room (timeout/network error)");
      }
      // Duplicate room error (Daily returns 409 or similar)
      if (error.response && error.response.status === 409 && roomName) {
        try {
          const existingRoom = await this.getRoom(roomName);
          if (existingRoom) {
            console.warn("Duplicate room error, returning existing room.");
            return existingRoom;
          }
        } catch (fetchErr) {
          console.error("Room not found after duplicate error:", fetchErr);
        }
      }
      // Log and rethrow other errors
      console.error(
        "Error creating Daily room:",
        error?.response?.data || error
      );
      throw new Error("Failed to create video room");
    }
  }

  /**
   * Get room details
   */
  async getRoom(roomName: string): Promise<DailyRoom> {
    try {
      const response = await this.client.get<DailyRoom>(`/rooms/${roomName}`);
      return response.data;
    } catch (error) {
      console.error("Error getting Daily room:", error);
      throw new Error("Failed to get room details");
    }
  }

  /**
   * Delete a room
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.client.delete(`/rooms/${roomName}`);
    } catch (error) {
      console.error("Error deleting Daily room:", error);
      throw new Error("Failed to delete room");
    }
  }

  /**
   * Generate a meeting token for a user
   */
  async generateMeetingToken(
    roomName: string,
    userId: string,
    userName: string,
    isOwner: boolean = false,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    try {
      const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

      // Daily expects 'room' not 'room_name' in the payload
      const tokenPayload = {
        properties: {
          room_name: roomName,
          user_id: userId,
          user_name: userName,
          is_owner: isOwner,
          exp: exp,
        },
      };

      const response = await this.client.post<{ token: string }>(
        "/meeting-tokens",
        tokenPayload
      );
      return response.data.token;
    } catch (error: any) {
      console.error(
        "Error generating meeting token:",
        error?.response?.data || error
      );
      throw new Error("Failed to generate meeting token");
    }
  }

  /**
   * Get room analytics/participants
   */
  async getRoomAnalytics(roomName: string): Promise<any> {
    try {
      const response = await this.client.get(`/rooms/${roomName}/analytics`);
      return response.data;
    } catch (error) {
      console.error("Error getting room analytics:", error);
      throw new Error("Failed to get room analytics");
    }
  }

  /**
   * Configure webhooks for Daily events
   */
  async configureWebhooks(): Promise<void> {
    try {
      const response = await this.client.get("/webhooks");

      if (response.data && response.data.length > 0) {
        console.log("Daily webhooks already configured");
        return;
      }

      const webhookUrl =
        process.env.WEBHOOK_URL ||
        "https://api.sociohub.site/api/webhooks/daily";

      // Configure webhook
      await this.client.post("/webhooks", {
        url: webhookUrl,
        eventTypes: [
          "participant.joined",
          "participant.left",
          "meeting.started",
          "meeting.ended",
        ],
      });

      console.log("Daily webhook configured successfully to:", webhookUrl);
    } catch (error) {
      console.error("Error configuring webhooks:", error);
      throw error;
    }
  }
}
