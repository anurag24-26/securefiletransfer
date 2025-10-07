import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-md">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
        
        {/* App name or tagline */}
        <h1 className="mt-6 text-2xl font-semibold text-indigo-400 tracking-wide animate-pulse">
          Crypterra
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Securing your cloud...</p>
      </div>
    </div>
  );
};

export default Loader;
