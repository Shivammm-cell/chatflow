import { useAuthStore } from "../../store/authStore";
import Avatar from "../ui/Avatar";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, showAvatar }) {
  const { user } = useAuthStore();
  const isOwn = message.sender?._id === user._id || message.sender === user._id;

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar (only for other's messages) */}
      {!isOwn && showAvatar ? (
        <Avatar name={message.sender?.username || "?"} src={message.sender?.avatar} size="sm" />
      ) : !isOwn ? (
        <div className="w-8 flex-shrink-0" />
      ) : null}

      <div className={`max-w-[70%] group ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-400 mb-1 ml-1">{message.sender?.username}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
          }`}
        >
          {message.content}
        </div>
        <span
          className={`text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isOwn ? "mr-1" : "ml-1"
          }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
