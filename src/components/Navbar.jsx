import React, { useState } from "react";
import assets from "../assets/assets";
import ThemeToggleBtn from "./ThemeToggleBtn";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryStore } from "../stores/queries";
import { useMutationStore } from "../stores/mutations";
import { Link } from "react-router-dom";

const Navbar = ({ theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useQueryStore();
  const { logout } = useMutationStore();

  const getInitials = (username) => {
    return username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-between items-center px-4 sm:px-12 lg:px-24 xl:px-40 py-4 sticky top-0 z-20 backdrop-blur-xl font-medium bg-white/50 dark:bg-gray-900/70"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer">
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current text-gray-800 dark:text-white"
        >
          <circle cx="50" cy="50" r="48" strokeWidth="4" />
          <path
            d="M30 55 L45 35 L70 65"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-2xl sm:text-3xl font-bold tracking-wide text-gray-900 dark:text-white">
          Veyno
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-5">
        <Link to="/" className="hover:border-b">
          Home
        </Link>
        <a href="#services" className="hover:border-b">
          Services
        </a>
        <a href="#our-work" className="hover:border-b">
          Our Work
        </a>
        <a href="#contact-us" className="hover:border-b">
          Contact Us
        </a>
        {user && (
          <Link to="/dashboard" className="hover:border-b">
            Dashboard
          </Link>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-white">
              {user.credits} Credits
            </span>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-semibold">
              {getInitials(user.username)}
            </div>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-700 dark:text-white hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-700 dark:text-white hover:underline"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-primary text-white px-4 py-1.5 rounded-full hover:scale-105 transition-transform"
            >
              Register
            </Link>
          </>
        )}
        <ThemeToggleBtn theme={theme} setTheme={setTheme} />
        <img
          src={theme === "dark" ? assets.menu_icon_dark : assets.menu_icon}
          alt="menu"
          onClick={() => setSidebarOpen(true)}
          className="w-8 sm:hidden cursor-pointer"
        />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 w-64 h-full bg-primary text-white z-50 flex flex-col pt-20 px-6 gap-6 shadow-lg"
          >
            <img
              src={assets.close_icon}
              alt="close"
              className="w-6 self-end cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            />
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="text-lg font-medium hover:underline"
            >
              Home
            </Link>
            <a
              href="#services"
              onClick={() => setSidebarOpen(false)}
              className="text-lg font-medium hover:underline"
            >
              Services
            </a>
            <a
              href="#our-work"
              onClick={() => setSidebarOpen(false)}
              className="text-lg font-medium hover:underline"
            >
              Our Work
            </a>
            <a
              href="#contact-us"
              onClick={() => setSidebarOpen(false)}
              className="text-lg font-medium hover:underline"
            >
              Contact Us
            </a>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="text-lg font-medium hover:underline"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="text-lg font-medium hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  className="text-lg font-medium hover:underline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setSidebarOpen(false)}
                  className="text-lg font-medium hover:underline"
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
