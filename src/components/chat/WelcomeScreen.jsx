import { MessageSquare } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function WelcomeScreen() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-400">
      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Welcome, {user?.username}!
      </h2>
      <p className="text-sm text-center max-w-xs">
        Select a conversation from the sidebar or click{" "}
        <span className="font-medium text-blue-500">+</span> to start a new chat.
      </p>
    </div>
  );
}
