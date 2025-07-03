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
      timeout: 10000,
    });
  }
  /**
   * Create a new Daily room
   */
  async createRoom(config: DailyRoomConfig): Promise<DailyRoom> {
    try {
      const response = await this.client.post<DailyRoom>("/rooms", config);
      return response.data;
    } catch (error) {
      console.error("Error creating Daily room:", error);
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

      const tokenPayload = {
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        is_owner: isOwner,
        exp: exp,
      };

      const response = await this.client.post<{ token: string }>(
        "/meeting-tokens",
        tokenPayload
      );
      return response.data.token;
    } catch (error) {
      console.error("Error generating meeting token:", error);
      throw new Error("Failed to generate meeting token");
    }
  }

  /**
   * Start recording a meeting
   */
  async startRecording(
    roomName: string,
    layout?: object
  ): Promise<DailyRecordingResponse> {
    try {
      const recordingConfig = {
        room_name: roomName,
        layout: layout || {
          preset: "default",
        },
      };

      const response = await this.client.post<DailyRecordingResponse>(
        "/recordings",
        recordingConfig
      );
      return response.data;
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error("Failed to start recording");
    }
  }

  /**
   * Stop recording a meeting
   */
  async stopRecording(recordingId: string): Promise<DailyRecordingResponse> {
    try {
      const response = await this.client.patch<DailyRecordingResponse>(
        `/recordings/${recordingId}`,
        {
          status: "finished",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error stopping recording:", error);
      throw new Error("Failed to stop recording");
    }
  }

  /**
   * Get recording details
   */
  async getRecording(recordingId: string): Promise<DailyRecordingResponse> {
    try {
      const response = await this.client.get<DailyRecordingResponse>(
        `/recordings/${recordingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting recording:", error);
      throw new Error("Failed to get recording details");
    }
  }

  /**
   * List recordings for a room
   */
  async listRecordings(roomName?: string): Promise<DailyRecordingResponse[]> {
    try {
      const params = roomName ? { room_name: roomName } : {};
      const response = await this.client.get<{
        data: DailyRecordingResponse[];
      }>("/recordings", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error listing recordings:", error);
      throw new Error("Failed to list recordings");
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
      const webhookUrl =
        process.env.WEBHOOK_URL ||
        "https://api.sociohub.site/api/webhooks/daily";

      // Configure webhook
      await this.client.post("/domains", {
        webhook_url: webhookUrl,
        webhook_events: [
          "participant.joined",
          "participant.left",
          "participant.updated",
          "meeting.started",
          "meeting.ended",
          "recording.started",
          "recording.finished",
          "recording.error",
        ],
      });

      console.log("Daily webhook configured successfully to:", webhookUrl);
    } catch (error) {
      console.error("Error configuring webhooks:", error);
      throw error;
    }
  }
}
