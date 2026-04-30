import Sidebar from "../components/chat/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import WelcomeScreen from "../components/chat/WelcomeScreen";
import { useChatStore } from "../store/chatStore";

export default function ChatPage() {
  const { activeConversation } = useChatStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — fixed width */}
      <div className="w-80 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main panel */}
      <div className="flex-1 h-full overflow-hidden">
        {activeConversation ? <ChatWindow /> : <WelcomeScreen />}
      </div>
    </div>
  );
}
