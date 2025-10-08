import React from "react";

const Footer = () => {
  return (
    <footer className="relative z-10 w-full py-4 mt-10 text-center text-gray-400 text-sm border-t border-gray-700 bg-slate-900/80 backdrop-blur-md">
      <p>
        © {new Date().getFullYear()} Crypterra. All rights reserved. | Secure Cloud Storage
      </p>
    </footer>
  );
};

export default Footer;
