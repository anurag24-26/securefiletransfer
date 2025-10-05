import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const MyOrganization = () => {
  const { token } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchOrg = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.get("/users/my-org-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrg(res.data.organization || null);
      } catch (err) {
        setErr("Could not fetch organization details.");
        setOrg(null);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrg();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-100 py-8 transition-colors">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full hover:shadow-blue-200 transition-shadow duration-200">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6 tracking-tight">
          My Organization
        </h1>

        {loading && (
          <p className="text-center text-lg text-gray-500 animate-pulse">Loading...</p>
        )}

        {err && (
          <p className="text-center text-red-500">{err}</p>
        )}

        {!loading && org && (
          <>
            <ul className="space-y-4">
              <li className="flex items-center justify-between border-b pb-2 group">
                <span className="font-semibold text-gray-600">Name:</span>
                <span className="text-lg text-gray-800 group-hover:text-indigo-700 transition">
                  {org.name}
                </span>
              </li>
              <li className="flex items-center justify-between border-b pb-2 group">
                <span className="font-semibold text-gray-600">Type:</span>
                <span className="capitalize text-gray-700 group-hover:text-indigo-700 transition">
                  {org.type}
                </span>
              </li>
              {org.parent && (
                <li className="flex items-center justify-between border-b pb-2 group">
                  <span className="font-semibold text-gray-600">Parent:</span>
                  <span className="text-gray-700 group-hover:text-indigo-700 transition">
                    {(typeof org.parent === "object" && org.parent?.name) ? org.parent.name : org.parent}
                  </span>
                </li>
              )}
              <li className="flex flex-col space-y-2 items-start pb-2 group">
                <span className="font-semibold text-gray-600">Admins:</span>
                {org.admins && org.admins.length > 0 ? (
                  org.admins.map((admin) =>
                    admin ? (
                      <div key={admin.id} className="text-right">
                        <span className="text-indigo-700 font-medium group-hover:underline transition block">{admin.name}</span>
                        <span className="text-xs text-gray-400 block">{admin.email}</span>
                        <span className="text-xs text-gray-400 capitalize">{admin.role.replace("Admin", " Admin")}</span>
                      </div>
                    ) : null
                  )
                ) : (
                  <span className="text-gray-400">No admins assigned</span>
                )}
              </li>
            </ul>
            <div className="mt-6 flex items-center justify-center">
              <span className="inline-flex items-center bg-indigo-50 px-4 py-1 text-sm text-indigo-600 rounded-full shadow-sm">
                <svg className="h-4 w-4 mr-1 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeDasharray="2 2" />
                </svg>
                Organization details are kept up to date.
              </span>
            </div>
          </>
        )}

        {!loading && !org && !err && (
          <div className="text-center text-gray-500 font-medium py-10">
            No organization or department assigned.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrganization;
