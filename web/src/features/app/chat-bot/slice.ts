import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "./components/chat-view";

export interface ToolStatus {
  tool: "document_retrieval" | "database_query" | "web_search";
  status: "running" | "complete";
  message: string;
}

export interface AgentThought {
  type: "reasoning" | "tool_call" | "tool_result" | "final_answer";
  title: string;
  description: string;
  timestamp: number;
  toolName?: string;
  status: "thinking" | "executing" | "completed" | "error";
}

interface ChatBotSlice {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  toolStatus: ToolStatus[];
  agentThought: AgentThought | null;
}

const initialState: ChatBotSlice = {
  sessionId: null,
  messages: [
    {
      id: "1",
      isUser: false,
      text: "### 👋 Welcome to SocioBot\nHi! I'm here to help you with anything related to SocioHub — societies, events, settings, and more.\nLet’s get started!",
      timestamp: new Date().toISOString(),
    },
  ],
  isLoading: false,
  isError: false,
  error: null,
  toolStatus: [],
  agentThought: null,
};

const chatBotSlice = createSlice({
  name: "chatBot",
  initialState,
  reducers: {
    setSessionId(state, action) {
      state.sessionId = action.payload;
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.isError = true;
      state.error = action.payload;
    },
    setToolStatus(state, action: PayloadAction<ToolStatus>) {
      const tool = state.toolStatus.find(
        (tool) => tool.tool === action.payload.tool
      );
      if (tool) {
        tool.status = action.payload.status;
        tool.message = action.payload.message;
      } else {
        state.toolStatus.push(action.payload);
      }
    },
    clearToolStatus(state) {
      state.toolStatus = [];
    },
    setAgentThought(state, action: PayloadAction<AgentThought>) {
      state.agentThought = action.payload;
    },
    clearAgentThought(state) {
      state.agentThought = null;
    },
    clearSession(state) {
      state.agentThought = null;
      state.error = null;
      state.isError = false;
      state.isLoading = false;
      state.messages = [];
      state.sessionId = null;
      state.toolStatus = [];
    },
  },
});

export const {
  addMessage,
  clearMessages,
  setSessionId,
  setError,
  setLoading,
  setToolStatus,
  clearToolStatus,
  setAgentThought,
  clearAgentThought,
  clearSession,
} = chatBotSlice.actions;

export default chatBotSlice.reducer;
