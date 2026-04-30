import { create } from "zustand";
import api from "../lib/axios";
import { getSocket } from "../lib/socket";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},  // { conversationId: [{ userId, username }] }
  isLoadingMessages: false,
  isLoadingConversations: false,
  searchResults: [],
  isSearching: false,

  // ─── Conversations ──────────────────────────────────
  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const { data } = await api.get("/conversations");
      set({ conversations: data });
    } catch (err) {
      toast.error("Failed to load conversations");
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  startConversation: async (userId) => {
    try {
      const { data } = await api.post("/conversations", { userId });
      const { conversations } = get();
      const exists = conversations.find((c) => c._id === data._id);
      if (!exists) {
        set({ conversations: [data, ...conversations] });
      }
      get().setActiveConversation(data);
      return data;
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  },

  setActiveConversation: (conversation) => {
    const prev = get().activeConversation;
    const socket = getSocket();

    // Leave previous room
    if (prev) socket?.emit("leaveConversation", prev._id);

    // Join new room
    if (conversation) socket?.emit("joinConversation", conversation._id);

    set({ activeConversation: conversation, messages: [] });

    if (conversation) get().fetchMessages(conversation._id);
  },

  // ─── Messages ───────────────────────────────────────
  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      set({ messages: data });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content) => {
    const { activeConversation, messages } = get();
    if (!activeConversation) return;

    try {
      const { data } = await api.post("/messages", {
        conversationId: activeConversation._id,
        content,
      });
      // Optimistic update — server also broadcasts via socket
      set({ messages: [...messages, data] });
      get()._updateConversationLastMessage(activeConversation._id, data);
    } catch {
      toast.error("Failed to send message");
    }
  },

  // ─── Socket event handlers (called from useSocket hook) ─
  addMessage: (message) => {
    const { messages, activeConversation } = get();
    if (activeConversation?._id === message.conversationId) {
      // Avoid duplicate if we're the sender (optimistic update already added it)
      const exists = messages.some((m) => m._id === message._id);
      if (!exists) set({ messages: [...messages, message] });
    }
    get()._updateConversationLastMessage(message.conversationId, message);
  },

  _updateConversationLastMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === conversationId ? { ...c, lastMessage: message, updatedAt: message.createdAt } : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    }));
  },

  // ─── Presence ────────────────────────────────────────
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  setUserOffline: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  // ─── Typing ──────────────────────────────────────────
  setTyping: ({ userId, username, conversationId }) => {
    set((state) => {
      const prev = state.typingUsers[conversationId] || [];
      if (prev.find((u) => u.userId === userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...prev, { userId, username }],
        },
      };
    });
  },

  clearTyping: ({ userId, conversationId }) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] || []).filter(
          (u) => u.userId !== userId
        ),
      },
    }));
  },

  // ─── User search ─────────────────────────────────────
  searchUsers: async (query) => {
    if (!query || query.length < 2) return set({ searchResults: [] });
    set({ isSearching: true });
    try {
      const { data } = await api.get(`/users/search?q=${query}`);
      set({ searchResults: data });
    } catch {
      set({ searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [], isSearching: false }),
}));
