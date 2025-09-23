import React, { useState } from "react";
import { useMutationStore } from "../stores/mutations";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Loader from "../components/Loader";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading, error } = useMutationStore();
  const navigate = useNavigate();

  const handleRegister = async () => {
    await register(email, username, password);
    if (!error) {
      navigate("/dashboard");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 py-20 px-4 sm:px-12 lg:px-24 xl:px-40 text-center w-full text-gray-700 dark:text-white bg-white dark:bg-gray-900"
      >
        <h1 className="text-3xl sm:text-4xl font-medium">Register for Veyno</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-white/75 max-w-md">
          Create an account to start orchestrating webhooks with Veyno.
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
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            onClick={handleRegister}
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Register;
