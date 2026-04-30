import { create } from "zustand";
import api from "../lib/axios";
import { connectSocket, disconnectSocket } from "../lib/socket";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
      connectSocket();
    } catch {
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", formData);
      set({ user: data });
      connectSocket();
      toast.success("Account created!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", formData);
      set({ user: data });
      connectSocket();
      toast.success(`Welcome back, ${data.username}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    disconnectSocket();
    set({ user: null });
    toast.success("Logged out");
  },

  updateProfile: async (formData) => {
    try {
      const { data } = await api.put("/auth/profile", formData);
      set({ user: data });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  },
}));
