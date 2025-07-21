import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat, Message } from "./types";
import { chatsApi } from "./api";
import { RootState } from "@/app/store";

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  isRefreshing: boolean;
  onlineUsers: { [key: string]: boolean };
  typingUsers: { [chatId: string]: string[] };
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  isRefreshing: false,
  onlineUsers: {},
  typingUsers: {},
};

export const addMessageWithRefresh = createAsyncThunk(
  "chat/addMessageWithRefresh",
  async (message: Message, { getState, dispatch }) => {
    const state = getState() as RootState;
    const currentUser = state.auth.user;
    const chatExists = state.chats.chats.some(
      (chat) => chat.id === message.chatId
    );

    if (!chatExists) {
      // Chat doesn't exist, we need to refresh chats from backend
      const result = await dispatch(
        chatsApi.endpoints.getChats.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      return {
        message,
        refreshedChats: result,
        chatWasRefreshed: true,
        currentUserId: currentUser?.id || null,
      };
    }

    // Chat exists, proceed normally
    return {
      message,
      refreshedChats: null,
      chatWasRefreshed: false,
      currentUserId: currentUser?.id || null,
    };
  }
);

export const handleChatDeletionOrLeave = createAsyncThunk(
  "chat/handleChatDeletionOrLeave",
  async (_, { dispatch }) => {
    // Refetch chats to update the list
    dispatch(
      chatsApi.endpoints.getChats.initiate(undefined, { forceRefetch: true })
    );
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action: PayloadAction<string | undefined>) => {
      const chat = state.chats.find((chat) => chat.id === action.payload);
      state.activeChat = chat ?? null;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      if (state.activeChat) {
        state.activeChat.messages = action.payload;
      }
    },
    addMessage: (
      state,
      action: PayloadAction<{ message: Message; currentUserId: string }>
    ) => {
      const { message, currentUserId } = action.payload;

      if (state.activeChat && state.activeChat.id === message.chatId) {
        state.activeChat.messages.push(message);
      }
      const chatIndex = state.chats.findIndex((c) => c.id === message.chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].messages = [message];
        // Increment unread count if the message is not from the current user and the chat is not active
        if (
          message.senderId !== currentUserId &&
          state.activeChat?.id !== message.chatId
        ) {
          state.chats[chatIndex].unreadCount =
            (state.chats[chatIndex].unreadCount || 0) + 1;
        }
        // Move the updated chat to the top
        const updatedChat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(updatedChat);
      }
    },
    setOnlineUsers: (
      state,
      action: PayloadAction<{ [key: string]: boolean }>
    ) => {
      state.onlineUsers = action.payload;
    },
    setUserOnline: (state, action: PayloadAction<string>) => {
      state.onlineUsers[action.payload] = true;
    },
    setUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers[action.payload] = false;
    },
    startTyping: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>
    ) => {
      const { chatId, userId } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }
      if (!state.typingUsers[chatId].includes(userId)) {
        state.typingUsers[chatId].push(userId);
      }
    },
    stopTyping: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>
    ) => {
      const { chatId, userId } = action.payload;
      if (state.typingUsers[chatId]) {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(
          (id) => id !== userId
        );
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{
        id: string;
        chatId: string;
        updates: Partial<Message>;
      }>
    ) => {
      const { id, chatId, updates } = action.payload;

      if (state.activeChat && state.activeChat.id === chatId) {
        const message = state.activeChat.messages.find((m) => m.id === id);
        if (message) {
          Object.assign(message, updates);
        }
      }

      const chatInList = state.chats.find((c) => c.id === chatId);
      if (chatInList) {
        const message = chatInList.messages.find((m) => m.id === id);
        if (message) {
          Object.assign(message, updates);
        }
      }
    },
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      const chatIndex = state.chats.findIndex((c) => c.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
      if (state.activeChat && state.activeChat.id === chatId) {
        state.activeChat.unreadCount = 0;
      }
    },
    deleteMessage: (
      state,
      action: PayloadAction<{ messageId: string; chatId: string }>
    ) => {
      const { messageId, chatId } = action.payload;

      // Remove from activeChat if it's the current chat
      if (state.activeChat && state.activeChat.id === chatId) {
        state.activeChat.messages = state.activeChat.messages.filter(
          (message) => message.id !== messageId
        );
      }

      // Update the last message in the chat list if the deleted message was the last one
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        if (chat.messages && chat.messages[0]?.id === messageId) {
          // If the deleted message was the last one, clear it or fetch new last message
          // For simplicity, we'll clear it here. A refetch of chats might be better for accuracy.
          chat.messages = [];
        }
      }
    },
    removeChatParticipant: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>
    ) => {
      const { chatId, userId } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        chat.participants = chat.participants.filter(
          (p) => (p.student?.id || p.advisor?.id) !== userId
        );
        if (state.activeChat && state.activeChat.id === chatId) {
          state.activeChat.participants = state.activeChat.participants.filter(
            (p) => (p.student?.id || p.advisor?.id) !== userId
          );
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMessageWithRefresh.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(addMessageWithRefresh.fulfilled, (state, action) => {
        state.isRefreshing = false;
        const { message, refreshedChats, chatWasRefreshed, currentUserId } =
          action.payload;

        if (chatWasRefreshed && refreshedChats) {
          const oldActiveChatMessages = state.activeChat?.messages ?? [];
          state.chats = refreshedChats;

          if (state.activeChat) {
            const updatedActiveChat = state.chats.find(
              (chat) => chat.id === state.activeChat?.id
            );
            if (updatedActiveChat) {
              state.activeChat = {
                ...updatedActiveChat,
                messages: oldActiveChatMessages,
              };
            } else {
              state.activeChat = null;
            }
          }
        }

        if (state.activeChat && state.activeChat.id === message.chatId) {
          if (!state.activeChat.messages.some((m) => m.id === message.id)) {
            state.activeChat.messages.push(message);
          }
        }

        const chatIndex = state.chats.findIndex((c) => c.id === message.chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages = [message];

          if (
            message.sender.advisorId !== currentUserId &&
            message.sender.studentId !== currentUserId &&
            state.activeChat?.id !== message.chatId
          ) {
            state.chats[chatIndex].unreadCount =
              (state.chats[chatIndex].unreadCount || 0) + 1;
          }

          const updatedChat = state.chats.splice(chatIndex, 1)[0];
          state.chats.unshift(updatedChat);
        } else {
          console.warn("Chat still not found after refresh:", message.chatId);
        }
      })
      .addCase(addMessageWithRefresh.rejected, (state, action) => {
        state.isRefreshing = false;
        console.error("Failed to add message with refresh:", action.error);
      });
  },
});

export const {
  setChats,
  setActiveChat,
  setMessages,
  addMessage,
  setOnlineUsers,
  setUserOnline,
  setUserOffline,
  startTyping,
  stopTyping,
  updateMessage,
  markChatAsRead,
  deleteMessage,
  removeChatParticipant,
} = chatSlice.actions;

export default chatSlice.reducer;
