import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, LogOut, User, X, Loader2, MessageSquare } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import Avatar from "../ui/Avatar";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    conversations,
    activeConversation,
    onlineUsers,
    fetchConversations,
    setActiveConversation,
    searchUsers,
    searchResults,
    isSearching,
    startConversation,
    clearSearch,
    isLoadingConversations,
  } = useChatStore();

  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearchClose = () => {
    setShowSearch(false);
    setQuery("");
    clearSearch();
  };

  const handleStartChat = async (userId) => {
    await startConversation(userId);
    handleSearchClose();
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => p._id !== user._id) || conv.participants?.[0];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h1 className="font-bold text-gray-900 text-lg">ChatFlow</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition text-gray-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-9 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
            />
            <button
              onClick={handleSearchClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              readOnly
              onClick={() => setShowSearch(true)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm cursor-pointer focus:outline-none border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Search results */}
      {showSearch && query.length >= 2 && (
        <div className="border-b border-gray-100">
          {isSearching ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">No users found</p>
          ) : (
            <div className="p-2 space-y-1">
              <p className="text-xs text-gray-400 px-2 pb-1">Users</p>
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleStartChat(u._id)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition text-left"
                >
                  <Avatar name={u.username} src={u.avatar} size="sm" online={onlineUsers.includes(u._id)} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoadingConversations ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 px-6 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200" />
            <p className="text-sm">No conversations yet. Click + to start chatting.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isActive = activeConversation?._id === conv._id;
            const isOnline = onlineUsers.includes(other?._id);
            const name = conv.isGroup ? conv.groupName : other?.username || "Unknown";
            const lastMsg = conv.lastMessage;

            return (
              <button
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${
                  isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
              >
                <Avatar name={name} src={other?.avatar} size="md" online={isOnline} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                      {name}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(lastMsg.createdAt || conv.updatedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {lastMsg
                      ? `${lastMsg.sender?.username === user.username ? "You: " : ""}${lastMsg.content}`
                      : "Start chatting"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Current user footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-1">
          <Avatar name={user.username} src={user.avatar} size="sm" online={true} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
