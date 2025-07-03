import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { Meeting } from "@/types";
import { DailyCall, DailyParticipant } from "@daily-co/daily-js";

// Meeting states
export type MeetingState =
  | "idle"
  | "pre-join"
  | "in-meeting"
  | "ending"
  | "ended";

// Daily.co call state
export type CallState = "idle" | "joining" | "joined" | "left" | "error";

export interface MeetingCredentials {
  dailyRoomUrl: string;
  dailyToken: string;
  meeting: {
    id: string;
    title: string;
    host: string;
    isHost: boolean;
  };
}

export interface MeetingContextState {
  state: MeetingState;
  callState: CallState;
  meeting: Meeting | null;
  credentials: MeetingCredentials | null;
  error: string | null;
  participants: DailyParticipant[];
  callObject: DailyCall | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isChatVisible: boolean;
  isMeetingModalOpen: boolean;
}

type MeetingAction =
  | { type: "SET_STATE"; payload: MeetingState }
  | { type: "SET_CALL_STATE"; payload: CallState }
  | { type: "SET_MEETING"; payload: Meeting }
  | { type: "SET_CREDENTIALS"; payload: MeetingCredentials }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_PARTICIPANTS"; payload: DailyParticipant[] }
  | { type: "SET_CALL_OBJECT"; payload: DailyCall }
  | { type: "TOGGLE_AUDIO" }
  | { type: "TOGGLE_VIDEO" }
  | { type: "TOGGLE_SCREEN_SHARE" }
  | { type: "TOGGLE_CHAT" }
  | { type: "RESET" }
  | { type: "SHOW_MEETING_MODAL" }
  | { type: "HIDE_MEETING_MODAL" };

const initialState: MeetingContextState = {
  state: "idle",
  callState: "idle",
  meeting: null,
  credentials: null,
  error: null,
  participants: [],
  callObject: null,
  isAudioEnabled: false,
  isVideoEnabled: false,
  isScreenSharing: false,
  isChatVisible: false,
  isMeetingModalOpen: false,
};

function meetingReducer(
  state: MeetingContextState,
  action: MeetingAction
): MeetingContextState {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, state: action.payload };
    case "SET_CALL_STATE":
      return { ...state, callState: action.payload };
    case "SET_MEETING":
      return { ...state, meeting: action.payload };
    case "SET_CREDENTIALS":
      return { ...state, credentials: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_PARTICIPANTS":
      return { ...state, participants: action.payload };
    case "SET_CALL_OBJECT":
      return { ...state, callObject: action.payload };
    case "TOGGLE_AUDIO":
      return { ...state, isAudioEnabled: !state.isAudioEnabled };
    case "TOGGLE_VIDEO":
      return { ...state, isVideoEnabled: !state.isVideoEnabled };
    case "TOGGLE_SCREEN_SHARE":
      return { ...state, isScreenSharing: !state.isScreenSharing };
    case "TOGGLE_CHAT":
      return { ...state, isChatVisible: !state.isChatVisible };
    case "RESET":
      return initialState;
    case "SHOW_MEETING_MODAL":
      return { ...state, isMeetingModalOpen: true };
    case "HIDE_MEETING_MODAL":
      return { ...state, isMeetingModalOpen: false };
    default:
      return state;
  }
}

export interface MeetingContextValue extends MeetingContextState {
  // Actions
  setState: (state: MeetingState) => void;
  setCallState: (state: CallState) => void;
  setMeeting: (meeting: Meeting) => void;
  setCredentials: (credentials: MeetingCredentials) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setParticipants: (participants: DailyParticipant[]) => void;
  setCallObject: (callObject: DailyCall) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleChat: () => void;
  leaveMeeting: () => void;
  reset: () => void;
  showMeetingModal: () => void;
  hideMeetingModal: () => void;
}

const MeetingContext = createContext<MeetingContextValue | null>(null);

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
};

interface MeetingProviderProps {
  children: React.ReactNode;
}

export const MeetingProvider: React.FC<MeetingProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);

  // Actions
  const setState = useCallback((newState: MeetingState) => {
    dispatch({ type: "SET_STATE", payload: newState });
  }, []);

  const setCallState = useCallback((newState: CallState) => {
    dispatch({ type: "SET_CALL_STATE", payload: newState });
  }, []);

  const setMeeting = useCallback((meeting: Meeting) => {
    dispatch({ type: "SET_MEETING", payload: meeting });
  }, []);

  const setCredentials = useCallback((credentials: MeetingCredentials) => {
    dispatch({ type: "SET_CREDENTIALS", payload: credentials });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const setParticipants = useCallback((participants: DailyParticipant[]) => {
    dispatch({ type: "SET_PARTICIPANTS", payload: participants });
  }, []);

  const setCallObject = useCallback((callObject: DailyCall) => {
    dispatch({ type: "SET_CALL_OBJECT", payload: callObject });
  }, []);

  const toggleAudio = useCallback(() => {
    dispatch({ type: "TOGGLE_AUDIO" });
  }, []);

  const toggleVideo = useCallback(() => {
    dispatch({ type: "TOGGLE_VIDEO" });
  }, []);

  const toggleScreenShare = useCallback(() => {
    dispatch({ type: "TOGGLE_SCREEN_SHARE" });
  }, []);

  const toggleChat = useCallback(() => {
    dispatch({ type: "TOGGLE_CHAT" });
  }, []);

  const leaveMeeting = useCallback(() => {
    if (state.callObject) {
      state.callObject.leave();
    }
    dispatch({ type: "SET_STATE", payload: "ending" });
  }, [state.callObject]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const showMeetingModal = useCallback(() => {
    dispatch({ type: "SHOW_MEETING_MODAL" });
  }, []);

  const hideMeetingModal = useCallback(() => {
    dispatch({ type: "HIDE_MEETING_MODAL" });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.callObject) {
        state.callObject.destroy();
      }
    };
  }, [state.callObject]);

  const value: MeetingContextValue = {
    ...state,
    setState,
    setCallState,
    setMeeting,
    setCredentials,
    setError,
    clearError,
    setParticipants,
    setCallObject,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleChat,
    leaveMeeting,
    reset,
    showMeetingModal,
    hideMeetingModal,
  };

  return (
    <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
  );
};
