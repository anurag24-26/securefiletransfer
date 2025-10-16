import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Settings,
  ChevronRight,
  CheckCircle,
  Unlock,
  Send,
  Save,
  X,
  Edit,
  UserCircle,
  Loader2,
} from 'lucide-react';

// --- MOCK DEPENDENCIES START ---
// NOTE: Since external files (like contexts and services) cannot be included,
// we are mocking them here to make the component runnable.

const mockApi = {
  defaults: {
    baseURL: "http://localhost:3000/api", // Mock API base URL for avatar path
  },
  // Mock implementations for demo
  get: () => Promise.resolve({ data: { requests: mockRequests } }),
  post: () => Promise.resolve({ data: {} }),
  put: () => Promise.resolve({ data: { user: mockUser } }),
};

const mockUser = {
  // Using a cleaner, high-contrast background image placeholder
  avatar: "https://placehold.co/128x128/9f7aea/ffffff?text=ER",
  name: "Dr. Evelyn Reed",
  email: "e.reed@acmeorg.com",
  role: "orgAdmin",
  orgHierarchy: [
    { name: "Acme Corp" },
    { name: "R&D Division" },
    { name: "Fusion Projects" },
  ],
};

const mockRequests = [
  { _id: "1", type: "role_change", message: "Need elevated access for new project deployment.", sender: { name: "John Doe" }, orgId: { name: "Sales" } },
  { _id: "2", type: "department_transfer", message: "Moving to a new team structure starting next quarter.", sender: { name: "Jane Smith" }, departmentId: { name: "Marketing" } },
];

// Mock Context Hook
const useAuth = () => {
  const [user, setUser] = useState(mockUser);
  const token = "mock-token";
  const logout = () => { console.log("Logged out"); };
  return { user, token, logout, setUser };
};

// Mock Navigator
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

// Mock Loader Component
const Loader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900/90 text-white text-2xl font-semibold">
        <Loader2 className="animate-spin mr-3 text-indigo-400" size={32} /> Loading Dashboard...
    </div>
);
// --- MOCK DEPENDENCIES END ---


// Component for the hierarchy arrow/separator
const HierarchyArrow = () => (
  <ChevronRight className="text-indigo-500/80 w-4 h-4 mx-1.5 flex-shrink-0" />
);

// Reusable Request Section - Highly Refined
const RequestSection = ({ title, color, requests, respondToRequest }) => {
  const isIndigo = color === "indigo";
  const titleColor = isIndigo ? "text-indigo-700" : "text-purple-700";
  const icon = isIndigo ? <Unlock className="w-6 h-6" /> : <Send className="w-6 h-6" />;
  const badgeClass = isIndigo ? "bg-indigo-200/90 text-indigo-800 border-indigo-400" : "bg-purple-200/90 text-purple-800 border-purple-400";
  const cardHoverClass = isIndigo ? "hover:bg-indigo-50/70" : "hover:bg-purple-50/70";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-3xl border border-white/70 bg-white/60 backdrop-blur-3xl shadow-2xl"
    >
      <h2 className={`text-2xl font-extrabold ${titleColor} mb-6 border-b border-gray-400/70 pb-3 flex items-center gap-3`}>
        {icon} {title} ({requests.length})
      </h2>
      <div className="space-y-4">
        {requests.map((r) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
            className={`p-4 border border-white/80 rounded-xl bg-white/80 flex flex-col md:flex-row justify-between items-start md:items-center transition-all duration-300 shadow-lg ${cardHoverClass}`}
          >
            <div className="flex-1 pr-4">
                <p className="text-gray-800 text-base leading-snug">
                  <strong className="text-gray-900">{r.sender?.name}</strong> has a request of type:{" "}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold capitalize border ${badgeClass}`}>
                    {r.type.replace('_', ' ')}
                  </span>{" "}
                  for{" "}
                  <strong className="text-indigo-700">
                    {r.orgId?.name || r.departmentId?.name || "an Entity"}
                  </strong>
                </p>
                {r.message && (
                    <p className="italic text-xs text-gray-700 mt-2 p-2 border-l-4 border-purple-500 bg-gray-100/70 rounded-r-lg">
                        "{r.message}"
                    </p>
                )}
            </div>
            
            <div className="flex gap-3 mt-3 md:mt-0 flex-shrink-0">
              {isIndigo ? ( // Admin actions
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => respondToRequest(r._id, "approve")}
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-md transition"
                  >
                    <CheckCircle className="mr-1 w-4 h-4" /> Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => respondToRequest(r._id, "reject")}
                    className="flex items-center bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-md transition"
                  >
                    <X className="mr-1 w-4 h-4" /> Reject
                  </motion.button>
                </>
              ) : ( // User status
                 <span className="px-3 py-1.5 bg-gray-300/80 text-gray-700 rounded-xl text-sm font-bold shadow-inner flex items-center">
                    <Loader2 className="animate-spin inline mr-2 w-4 h-4" /> Pending
                 </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};


const App = () => {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminRequests, setAdminRequests] = useState(mockRequests);
  const [myRequests, setMyRequests] = useState(mockRequests);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (user?.name) setEditName(user.name);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    // Simulating initial data fetch
    setTimeout(() => {
        setLoading(false);
    }, 500);
  }, [token, setUser, logout, navigate]);

  const respondToRequest = async (id, action) => {
    console.log(`Request ${id} ${action}ed`);
    // Mocking response logic
    setAdminRequests((prev) => prev.filter((r) => r._id !== id));
    setMyRequests((prev) => prev.filter((r) => r._id !== id));
    if (action === "approve") {
        setUser(prev => ({ ...prev, role: "superAdmin" }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (editName === user.name && !selectedFile) {
      setIsEditing(false);
      return;
    }
      
    try {
      setUpdating(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newName = editName || user.name;
      setUser(prev => ({ ...prev, name: newName })); 

      setIsEditing(false);
      setEditName(newName);
      setSelectedFile(null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch {
      console.error("Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-red-400 text-xl mb-6 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-indigo-700 to-purple-600 px-6 py-3 rounded-full font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-500 transition-all text-lg"
        >
          Retry Connection
        </button>
      </div>
    );

  const isAdmin = ["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role);

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-cover bg-center relative text-gray-900 overflow-hidden"
      style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1541355422894-cd0c3d9a16f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMDkyMnwwfDF8c2VhcmNofDEyfHxncmFwaGljJTIwZGVzaWduJTIwcGF0dGVybnxlbnwwfHx8fDE3MTgxOTMyNTl8MA&ixlib=rb-4.0.3&q=80&w=1080')`,
          fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Darker, softer overlay for better contrast and color blend */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" /> 

      {/* Subtle blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-70 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-70 animate-ping-slow" />
      
      {/* Keyframe definitions for custom slow pulse/ping animations */}
      <style>
        {`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.9; }
          }
          @keyframes ping-slow {
            75%, 100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          .animate-pulse-slow {
            animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .animate-ping-slow {
            animation: ping-slow 5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}
      </style>

      {/* Toast Notification */}
      <AnimatePresence>
        {updateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500/95 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md border border-white/80"
          >
            <CheckCircle className="text-xl w-6 h-6" /> Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-grow flex items-start justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl w-full p-8 sm:p-10 rounded-[2.5rem] border border-white/70 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
          style={{
            // Premium Glassmorphism effect
            background: "rgba(255, 255, 255, 0.35)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
          }}
        >
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-gray-400/50 pb-5">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 drop-shadow-md leading-tight">
              Welcome, <span className="text-indigo-700">{user?.name?.split(" ")[0] ?? "User"}</span>
            </h1>
            <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) setSelectedFile(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-base shadow-xl transition-all duration-300 ${
                  isEditing
                    ? "bg-rose-600 text-white hover:bg-rose-500 border border-white/80"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 border border-white/50"
                }`}
              >
                {isEditing ? <><X className="w-5 h-5" /> Close</> : <><Settings className="w-5 h-5" /> Edit Profile</>}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 bg-white/95 hover:bg-white px-6 py-3 rounded-full font-semibold text-gray-800 border border-gray-300 shadow-md text-base transition-all duration-300"
              >
                <LogOut className="w-5 h-5" /> Logout
              </motion.button>
            </div>
          </div>

          {/* Account Details */}
          <motion.section
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 p-8 rounded-[2rem] border border-white/80 bg-white/70 backdrop-blur-3xl shadow-3xl"
          >
            <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 flex items-center gap-2 border-b border-indigo-300 pb-3">
              <UserCircle className="w-6 h-6" /> Your Account Details
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
              <div className="relative w-32 h-32 flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={`${mockApi.defaults.baseURL.replace(/\/api$/, "")}${user.avatar}`}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-xl shadow-indigo-400/70 transition-transform duration-500"
                  />
                ) : (
                  <UserCircle className="text-[8rem] text-gray-500/70 w-32 h-32" />
                )}
                {/* Role Badge */}
                <span className="absolute bottom-0 right-0 bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border-2 border-white">
                  {user?.role}
                </span>
              </div>
              <div className="space-y-4 text-gray-800 text-lg flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <strong className="text-indigo-600 block text-sm uppercase tracking-wider font-extrabold">Name:</strong>
                    <span className="font-semibold text-gray-900 text-xl">{user?.name}</span>
                  </div>
                  <div>
                    <strong className="text-indigo-600 block text-sm uppercase tracking-wider font-extrabold">Email:</strong>
                    <span className="font-semibold text-gray-900 text-xl">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {user?.orgHierarchy?.length > 0 && (
              <div className="mt-8 border-t border-gray-400/70 pt-5">
                <strong className="text-xl mb-3 block text-gray-900 font-extrabold">
                  Organizational Path:
                </strong>
                <div className="flex flex-wrap items-center gap-y-3">
                  {user.orgHierarchy.map((o, i) => (
                    <React.Fragment key={i}>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="px-5 py-2 bg-indigo-200/90 border border-indigo-400 rounded-full text-base text-indigo-800 font-bold shadow-md backdrop-blur-sm"
                      >
                        {o.name}
                      </motion.span>
                      {i < user.orgHierarchy.length - 1 && <HierarchyArrow />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          {/* Edit Profile Form */}
          <AnimatePresence>
            {isEditing && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleProfileUpdate}
                className="mt-8 p-8 rounded-[2rem] border border-indigo-500/50 bg-white/80 backdrop-blur-3xl shadow-3xl space-y-6"
              >
                <h2 className="text-xl font-extrabold text-indigo-800 flex items-center gap-2 border-b border-indigo-400 pb-2">
                  <Edit className="w-5 h-5" /> Update Profile Information
                </h2>
                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-white/90 border border-gray-300 focus:ring-4 focus:ring-indigo-500/50 outline-none text-gray-900 transition-all shadow-inner font-medium"
                    placeholder="Enter new full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-bold text-sm">Avatar Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full text-base text-gray-800 bg-white/90 border border-gray-300 p-3 rounded-xl cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-extrabold hover:file:bg-indigo-500 transition-colors shadow-inner"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(79, 70, 229, 0.6)" }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={updating}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-4 rounded-xl font-extrabold text-white disabled:opacity-60 transition-all shadow-2xl text-lg"
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Save Changes
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Requests Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {isAdmin && adminRequests.length > 0 && (
              <RequestSection
                title="Pending Admin Approvals"
                color="indigo"
                requests={adminRequests}
                respondToRequest={respondToRequest}
              />
            )}
            {myRequests.length > 0 && (
              <RequestSection
                title="My Sent Requests"
                color="purple"
                requests={myRequests}
                respondToRequest={respondToRequest}
              />
            )}
          </div>
          
          {/* Fallback Message for Users with no requests */}
          {(!isAdmin || adminRequests.length === 0) && myRequests.length === 0 && (
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 p-8 text-center rounded-2xl border border-dashed border-gray-400 bg-white/50 backdrop-blur-xl shadow-inner text-gray-700"
             >
                <p className="text-xl font-semibold flex items-center justify-center">
                    <CheckCircle className="text-green-500 mr-2 w-6 h-6" /> All clear! You have no pending requests at this time.
                </p>
             </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default App;
