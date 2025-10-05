import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import OrgList from "./pages/OrgList";
import FileList from "./pages/FileList";
import AdminSettings from "./pages/AdminSettings"
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orglist" element={<OrgList />} />
          <Route path="/filelist" element={<FileList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/adminSettings" element={<AdminSettings/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
