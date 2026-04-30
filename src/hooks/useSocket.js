import { useEffect } from "react";
import { getSocket } from "../lib/socket";
import { useChatStore } from "../store/chatStore";

export const useSocket = () => {
  const { addMessage, setOnlineUsers, setUserOnline, setUserOffline, setTyping, clearTyping } =
    useChatStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("receiveMessage", addMessage);
    socket.on("onlineUsers", setOnlineUsers);
    socket.on("userOnline", ({ userId }) => setUserOnline(userId));
    socket.on("userOffline", ({ userId }) => setUserOffline(userId));
    socket.on("userTyping", setTyping);
    socket.on("userStopTyping", clearTyping);

    return () => {
      socket.off("receiveMessage", addMessage);
      socket.off("onlineUsers", setOnlineUsers);
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("userTyping", setTyping);
      socket.off("userStopTyping", clearTyping);
    };
  }, []);
};
