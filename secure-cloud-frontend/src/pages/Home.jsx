import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Home() {
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUserDetails(data.user);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Session expired. Please log in again.
        </h2>
        <button
          onClick={logout}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Secure Cloud Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{userDetails.email}</span>
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome, {userDetails.name || 'User'} 👋
        </h2>
        <p className="text-gray-600 mb-6">
          You are logged in as <strong>{userDetails.role}</strong>
          {userDetails.org && (
            <>
              {' '}in <strong>{userDetails.org.name}</strong> organization.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2 text-blue-700">Your Info</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>Name:</strong> {userDetails.name}</li>
              <li><strong>Email:</strong> {userDetails.email}</li>
              <li><strong>Role:</strong> {userDetails.role}</li>
              {userDetails.org && (
                <li><strong>Organization:</strong> {userDetails.org.name}</li>
              )}
            </ul>
          </div>

          <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-medium mb-2 text-blue-700">Quick Actions</h3>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => alert('Upload feature coming soon')}
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Upload File
              </button>
              <button
                onClick={() => alert('View Files feature coming soon')}
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                View Files
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
