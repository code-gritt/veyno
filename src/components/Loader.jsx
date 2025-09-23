import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/70 backdrop-blur-sm">
      <div className="relative w-48 h-48 flex flex-col items-center justify-center">
        {/* Spinners */}
        <span className="absolute w-24 h-24 border-8 border-white border-l-transparent border-r-transparent rounded-full animate-spin"></span>
        <span className="absolute w-18 h-18 border-8 border-white border-l-transparent border-r-transparent rounded-full animate-[spin_reverse_2s_linear_infinite]"></span>
        <span className="absolute w-10 h-10 border-8 border-white border-l-transparent border-r-transparent rounded-full animate-spin animate-duration-[4s]"></span>

        {/* Loading text */}
        <span className="relative top-36 text-white font-bold text-lg">
          LOADING...
        </span>
      </div>

      <style>{`
        @keyframes spin_reverse {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
