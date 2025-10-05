// import React, { useState, useEffect } from "react";
// import api from "../services/api";
// import { useAuth } from "../contexts/AuthContext";

// const Request = () => {
//   const { token, user } = useAuth();

//   // Form state
//   const [email, setEmail] = useState("");
//   const [requestedRole, setRequestedRole] = useState("user");
//   const [orgId, setOrgId] = useState("");
//   const [orgs, setOrgs] = useState([]);

//   // Requests list (for admins)
//   const [requests, setRequests] = useState([]);
//   const [loadingReq, setLoadingReq] = useState(false);
//   const [formLoading, setFormLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch user orgs for dropdown
//   useEffect(() => {
//     const fetchOrgs = async () => {
//       try {
//         const res = await api.get("/org/", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setOrgs(res.data.organizations || []);
//       } catch (err) {
//         // ignore
//       }
//     };
//     if (token) fetchOrgs();
//   }, [token]);

//   // Fetch pending requests
//   const fetchRequests = async () => {
//     setLoadingReq(true);
//     setError(null);
//     try {
//       const res = await api.get("/request/requests", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRequests(res.data.requests || []);
//     } catch (err) {
//       setError("Failed to load requests.");
//     } finally {
//       setLoadingReq(false);
//     }
//   };

//   useEffect(() => {
//     if (["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role)) {
//       fetchRequests();
//     }
//   }, [token, user]);

//   // Submit new request
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!orgId) {
//       alert("Please select an organization.");
//       return;
//     }
//     setFormLoading(true);
//     try {
//       await api.post(
//         "/request/requests",
//         { email, requestedRole, orgId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert("Request submitted successfully.");
//       setEmail("");
//       setRequestedRole("user");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to send request.");
//     }
//     setFormLoading(false);
//   };

//   // Approve or reject a request
//   const handleAction = async (id, action) => {
//     if (
//       !window.confirm(
//         `Are you sure you want to ${action} this request?`
//       )
//     )
//       return;

//     try {
//       await api.post(
//         `/request/requests/${id}/action`,
//         { action },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert(`Request ${action}ed successfully.`);
//       fetchRequests();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to process request.");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-10 mt-10">
//       <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
//         Submit a Request to Join or Manage Organization
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-4 bg-indigo-50 p-6 rounded shadow-inner">
//         <div>
//           <label className="block text-gray-700 font-semibold mb-1" htmlFor="email">
//             Email
//           </label>
//           <input
//             id="email"
//             type="email"
//             className="w-full p-3 rounded border border-indigo-300"
//             placeholder="Enter email to invite/request"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             disabled={formLoading}
//           />
//         </div>

//         <div>
//           <label className="block text-gray-700 font-semibold mb-1" htmlFor="org">
//             Organization
//           </label>
//           <select
//             id="org"
//             className="w-full p-3 rounded border border-indigo-300"
//             value={orgId}
//             onChange={(e) => setOrgId(e.target.value)}
//             required
//             disabled={formLoading}
//           >
//             <option value="">Select Organization</option>
//             {orgs.map((org) => (
//               <option key={org._id} value={org._id}>
//                 {org.name} ({org.type})
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-gray-700 font-semibold mb-1" htmlFor="role">
//             Requested Role
//           </label>
//           <select
//             id="role"
//             className="w-full p-3 rounded border border-indigo-300"
//             value={requestedRole}
//             onChange={(e) => setRequestedRole(e.target.value)}
//             disabled={formLoading}
//           >
//             <option value="user">User</option>
//             <option value="deptAdmin">Department Admin</option>
//             <option value="orgAdmin">Organization Admin</option>
//             {user.role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded transition"
//           disabled={formLoading}
//         >
//           {formLoading ? "Submitting..." : "Send Request"}
//         </button>
//       </form>

//       {["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role) && (
//         <section>
//           <h3 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
//             Pending Requests
//           </h3>

//           {loadingReq ? (
//             <p className="text-center text-gray-600">Loading requests...</p>
//           ) : error ? (
//             <p className="text-center text-red-500">{error}</p>
//           ) : requests.length === 0 ? (
//             <p className="text-center text-gray-600">No pending requests.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full rounded border border-indigo-200">
//                 <thead className="bg-indigo-100 text-indigo-700 font-semibold">
//                   <tr>
//                     <th className="p-3 border border-indigo-200">Email</th>
//                     <th className="p-3 border border-indigo-200">Organization</th>
//                     <th className="p-3 border border-indigo-200">Requested Role</th>
//                     <th className="p-3 border border-indigo-200">Requested By</th>
//                     <th className="p-3 border border-indigo-200">Requested At</th>
//                     <th className="p-3 border border-indigo-200">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((r) => (
//                     <tr key={r._id} className="hover:bg-indigo-50">
//                       <td className="p-3 border border-indigo-200">{r.email}</td>
//                       <td className="p-3 border border-indigo-200">{r.orgId?.name || "N/A"}</td>
//                       <td className="p-3 border border-indigo-200 capitalize">{r.requestedRole}</td>
//                       <td className="p-3 border border-indigo-200">{r.requestedBy?.name || "Unknown"}</td>
//                       <td className="p-3 border border-indigo-200">
//                         {new Date(r.createdAt).toLocaleString()}
//                       </td>
//                       <td className="p-3 border border-indigo-200 space-x-2">
//                         <button
//                           onClick={() => handleAction(r._id, "approve")}
//                           className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
//                         >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => handleAction(r._id, "reject")}
//                           className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
//                         >
//                           Reject
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </section>
//       )}
//     </div>
//   );
// };

// export default Request;
