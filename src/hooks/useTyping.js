import { useRef, useCallback } from "react";
import { getSocket } from "../lib/socket";
import { useChatStore } from "../store/chatStore";

export const useTyping = () => {
  const { activeConversation } = useChatStore();
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);

  const emitTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !activeConversation) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing", { conversationId: activeConversation._id });
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit("stopTyping", { conversationId: activeConversation._id });
    }, 1500);
  }, [activeConversation]);

  const emitStopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !activeConversation) return;
    clearTimeout(typingTimeout.current);
    isTyping.current = false;
    socket.emit("stopTyping", { conversationId: activeConversation._id });
  }, [activeConversation]);

  return { emitTyping, emitStopTyping };
};
