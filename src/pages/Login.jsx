import React, { useState } from "react";
import { useMutationStore } from "../stores/mutations";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useMutationStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login(email, password);
    if (!error) {
      navigate("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 py-20 px-4 sm:px-12 lg:px-24 xl:px-40 text-center w-full text-gray-700 dark:text-white bg-white dark:bg-gray-900"
    >
      <h1 className="text-3xl sm:text-4xl font-medium">Login to Veyno</h1>
      <p className="text-sm sm:text-base text-gray-500 dark:text-white/75 max-w-md">
        Access your webhook orchestration tools with your Veyno account.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-full px-4 py-2 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-full px-4 py-2 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
