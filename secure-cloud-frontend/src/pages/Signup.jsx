// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import api from "../services/api";
// import sideImage from "../assets/loginsideimage1.jpg";

// const Signup = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "user",
//   });
//   const [error, setError] = useState("");

//   const roles = [
//     { value: "user", label: "User" },
//     { value: "deptAdmin", label: "Department Admin" },
//     { value: "orgAdmin", label: "Organization Admin" },
//     { value: "superAdmin", label: "Super Admin" },
//   ];

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       await api.post("/auth/signup", form);
//       navigate("/login");
//     } catch (err) {
//       setError(err.response?.data?.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#0B1221] relative overflow-hidden">
//       {/* Background circles */}
//       <div className="absolute w-64 h-64 bg-indigo-600/20 rounded-full -top-20 -left-20 blur-3xl"></div>
//       <div className="absolute w-80 h-80 bg-blue-500/20 rounded-full bottom-0 right-0 blur-3xl"></div>

//       {/* Main card */}
//       <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden border border-gray-700/30 bg-white/10 backdrop-blur-2xl animate-fadeIn">
        
//         {/* Left Section - Form */}
//         <div className="w-full md:w-1/2 p-10 flex flex-col justify-center text-white">
//           <h2 className="text-3xl font-bold mb-2">Create Account</h2>
//           <p className="text-gray-300 mb-8 text-sm">
//             Join Crypterra to access your secure cloud collaboration dashboard
//           </p>

//           {error && (
//             <div className="text-red-400 mb-4 text-center font-medium animate-pulse">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Name */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-medium text-gray-300 mb-1"
//               >
//                 Full Name
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 name="name"
//                 placeholder="Enter your full name"
//                 value={form.name}
//                 onChange={handleChange}
//                 className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-300 mb-1"
//               >
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 name="email"
//                 placeholder="Enter your email"
//                 value={form.email}
//                 onChange={handleChange}
//                 className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-300 mb-1"
//               >
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 name="password"
//                 placeholder="Create a password"
//                 value={form.password}
//                 onChange={handleChange}
//                 className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 required
//               />
//             </div>

//             {/* Role */}
//             <div>
//               <label
//                 htmlFor="role"
//                 className="block text-sm font-medium text-gray-300 mb-1"
//               >
//                 Select Role
//               </label>
//               <select
//                 id="role"
//                 name="role"
//                 value={form.role}
//                 onChange={handleChange}
//                 className="w-full p-3 rounded-xl bg-white/10 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               >
//                 {roles.map((r) => (
//                   <option key={r.value} value={r.value} className="bg-[#0B1221]">
//                     {r.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300"
//             >
//               Sign Up
//             </button>
//           </form>

//           <p className="text-sm text-gray-400 text-center mt-6">
//             Already have an account?{" "}
//             <Link
//               to="/login"
//               className="text-blue-400 hover:underline hover:text-blue-300"
//             >
//               Login
//             </Link>
//           </p>
//         </div>

//         {/* Right Section - Illustration */}
//         <div className="hidden md:flex w-1/2 bg-white/10 justify-center items-center flex-col p-8">
//           <img
//             src={sideImage}
//             alt="illustration"
//             className="w-80 rounded-xl shadow-lg mb-6"
//           />
//           <h3 className="text-xl font-semibold text-gray-200">
//             Collaborate Securely
//           </h3>
//           <p className="text-gray-400 text-center text-sm mt-2 px-4">
//             Manage your organization’s cloud projects safely and efficiently with Crypterra’s advanced encryption tools.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;
