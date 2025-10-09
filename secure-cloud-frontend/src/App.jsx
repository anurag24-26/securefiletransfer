import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import Home from "./pages/Home";
import OrgList from "./pages/OrgList";
// import FileList from "./pages/FilesUpload";
import AdminSettings from "./pages/AdminSettings";
import Navbar from "./components/Navbar";
import MyOrganization from "./pages/MyOrganization";
import VisibleFiles from "./pages/FileList";
import Footer from "./components/Footer";
import ForgotPassword from "./components/Forget";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="pt-16"> {/* To offset fixed Navbar height */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orglist" element={<OrgList />} />
            {/* <Route path="/filelist" element={<FileList />} /> */}
            <Route path="/login" element={<Login />} />
             <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
            <Route path="/yourfiles" element={<VisibleFiles />} />
            <Route path="/adminSettings" element={<AdminSettings />} />
             <Route path="/myOrganization" element={<MyOrganization />} />
          </Routes>
        </div>
        <Footer/>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
