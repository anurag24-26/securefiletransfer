import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import AuthPage from "./pages/AuthPage";       // ✅ unified login/signup page
import Home from "./pages/Home";
import OrgList from "./pages/OrgList";
import AdminSettings from "./pages/AdminSettings";
import MyOrganization from "./pages/MyOrganization";
import VisibleFiles from "./pages/FileList";
import ForgotPassword from "./components/Forget";
import Logs from "./pages/Logs";
import About from "./pages/About";
import Verification from "./components/VerificationPage.jsx";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth guard
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    // ✅ AuthProvider must wrap BrowserRouter so all routes can access auth state
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="pt-16">
          <Routes>

            {/* ──────────── PUBLIC ROUTES ──────────── */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/about" element={<About />} />

            {/* ✅ Redirect old /login path to /auth (in case any links use it) */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />

            {/* ──────────── PROTECTED ROUTES ──────────── */}
            {/* All routes inside PrivateRoute require login */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/orglist" element={<OrgList />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/yourfiles" element={<VisibleFiles />} />
              <Route path="/adminSettings" element={<AdminSettings />} />
              <Route path="/myOrganization" element={<MyOrganization />} />
            </Route>

            {/* ──────────── FALLBACK ──────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;