import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Replace with your preferred image link, or use a local asset!
const BACKGROUND_IMAGE_URL =
  "https://4kwallpapers.com/images/walls/thumbs_3t/5666.jpg";

const ModernSVG = () => (
  <svg
    width="58"
    height="58"
    viewBox="0 0 58 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-4"
  >
    <circle cx="29" cy="29" r="29" fill="#e5e7eb" />
    <path d="M20 29L29 38L38 29" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M29 38V20" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isRegistering) {
        await register(username, password);
        setSuccess('Registration successful! Please log in.');
        setIsRegistering(false);
        setUsername('');
        setPassword('');
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      console.error(err);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9)",
          width: "100vw",
          height: "100vh",
          marginLeft: "500px",
        }}
      />

      {/* Overlay for subtle dimming */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "rgba(244,244,245,0.1)", // zinc-200 overlay
        }}
      />

      {/* Left Pane (Form) */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center bg-white bg-opacity-90 px-8 py-10">
        <div className="w-full max-w-lg mx-auto flex flex-col justify-center h-full">
          <h2 className="text-3xl font-extrabold text-left text-zinc-900 mb-7 tracking-tight">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {success && <p className="text-left text-sm text-green-600 pb-2">{success}</p>}
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-900 bg-zinc-100 placeholder:text-zinc-400"
                required
                autoComplete="username"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-700 text-zinc-900 bg-zinc-100 placeholder:text-zinc-400"
                required
                autoComplete={isRegistering ? "new-password" : "current-password"}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-600 text-sm text-left pt-1">{error}</p>}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 transition duration-300"
              >
                {isRegistering ? 'Register' : 'Login'}
              </button>
            </div>
          </form>
          <p className="text-sm text-left text-zinc-600 mt-7">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <span
              onClick={toggleMode}
              className="font-semibold hover:underline cursor-pointer ml-1 text-zinc-900"
            >
              {isRegistering ? 'Login' : 'Register'}
            </span>
          </p>
        </div>
      </div>

      {/* Right Pane (Branding) - Hidden on small screens */}
      <div className="relative z-10 hidden lg:flex w-1/2 items-center justify-center bg-transparent">
        <div className="max-w-md text-center">
          <div className="flex flex-col items-center">
            <ModernSVG />
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-zinc-900">Local Data Lab</h1>
            <p className="text-lg text-zinc-700 mb-4">
              Welcome back. Access your dashboard and manage your data with ease.
            </p>
            <hr className="border-t border-zinc-400 opacity-30 my-6" />
            <p className="text-sm text-zinc-500 italic">Modern. Secure. Fast.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;