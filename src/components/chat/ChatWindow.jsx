import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useTyping } from "../../hooks/useTyping";
import MessageBubble from "./MessageBubble";
import Avatar from "../ui/Avatar";

export default function ChatWindow() {
  const { user } = useAuthStore();
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    sendMessage,
    typingUsers,
    onlineUsers,
  } = useChatStore();
  const { emitTyping, emitStopTyping } = useTyping();

  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
    setText("");
  }, [activeConversation?._id]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    emitStopTyping();
    await sendMessage(content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (e.target.value) emitTyping();
    else emitStopTyping();
  };

  if (!activeConversation) return null;

  const getOtherParticipant = () =>
    activeConversation.participants?.find((p) => p._id !== user._id);

  const other = getOtherParticipant();
  const name = activeConversation.isGroup ? activeConversation.groupName : other?.username;
  const isOnline = onlineUsers.includes(other?._id);
  const typing = typingUsers[activeConversation._id] || [];

  // Group messages — show avatar only for first in a sequence from the same sender
  const shouldShowAvatar = (index) => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    const curr = messages[index];
    return prev.sender?._id !== curr.sender?._id;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shadow-sm">
        <Avatar name={name} src={other?.avatar} size="md" online={isOnline} />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <p className="text-xs text-gray-400">
            {activeConversation.isGroup
              ? `${activeConversation.participants?.length} members`
              : isOnline
              ? "Online"
              : other?.lastSeen
              ? `Last seen ${new Date(other.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
        {isLoadingMessages ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              showAvatar={shouldShowAvatar(i)}
            />
          ))
        )}

        {/* Typing indicator */}
        {typing.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {typing.map((t) => t.username).join(", ")} typing...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${name}...`}
            rows={1}
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition max-h-32 scrollbar-thin"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 ml-1">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
