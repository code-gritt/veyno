import React, { useState } from "react";
import assets from "../assets/assets";
import ThemeToggleBtn from "./ThemeToggleBtn";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <a href="#" className="hover:border-b">
          Home
        </a>
        <a href="#services" className="hover:border-b">
          Services
        </a>
        <a href="#our-work" className="hover:border-b">
          Our Work
        </a>
        <a href="#contact-us" className="hover:border-b">
          Contact Us
        </a>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggleBtn theme={theme} setTheme={setTheme} />

        {/* Mobile Menu Button */}
        <img
          src={theme === "dark" ? assets.menu_icon_dark : assets.menu_icon}
          alt="menu"
          onClick={() => setSidebarOpen(true)}
          className="w-8 sm:hidden cursor-pointer"
        />

        {/* Contact Button (desktop only) */}
        <a
          href="#contact-us"
          className="text-sm hidden sm:flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full cursor-pointer hover:scale-105 transition-transform"
        >
          Contact <img src={assets.arrow_icon} width={14} alt="arrow" />
        </a>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 right-0 w-64 h-full bg-primary text-white z-999 flex flex-col pt-20 px-6 gap-6 shadow-lg"
          >
            {/* Close Button */}
            <img
              src={assets.close_icon}
              alt="close"
              className="w-6 self-end cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Links */}
            <a
              href="#"
              onClick={() => setSidebarOpen(false)}
              className="text-lg font-medium hover:underline"
            >
              Home
            </a>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
