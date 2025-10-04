import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <span>Secure Cloud</span>
      {user ? (
        <div className="flex items-center gap-3">
          <span>{user.name}</span>
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <span>Guest</span>
      )}
    </nav>
  );
}
