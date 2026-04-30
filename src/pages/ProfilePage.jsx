import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Avatar from "../components/ui/Avatar";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/8.x/avataaars/svg?seed=alpha",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=beta",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=gamma",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=delta",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=epsilon",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=zeta",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto py-10 px-4">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to chats
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h1>

          {/* Avatar selector */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar name={form.username} src={form.avatar} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">Choose an avatar</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {AVATAR_PRESETS.map((url) => (
                <button
                  key={url}
                  onClick={() => setForm({ ...form, avatar: url })}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                    form.avatar === url ? "border-blue-500 scale-110" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={150}
                rows={3}
                placeholder="Tell people a bit about yourself..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/150</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
