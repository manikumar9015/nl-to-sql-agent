import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between modes
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth(); // Get the new register function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isRegistering) {
        await register(username, password);
        setSuccess('Registration successful! Please log in.');
        setIsRegistering(false); // Switch back to login mode
        setUsername('');
        setPassword('');
      } else {
        await login(username, password);
      }
    } catch (err) {
      // Get a more specific error message from the backend if available
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
    <div className="flex items-center justify-center h-screen bg-zinc-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-black">
          {isRegistering ? 'Create a New Account' : 'Local Data Lab Login'}
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {success && <p className="text-center text-sm text-green-600">{success}</p>}
          <div>
            <label className="text-sm font-bold text-black block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mt-1 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-black block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black text-white font-semibold rounded-md hover:bg-zinc-800"
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-black">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={toggleMode}
            className="font-semibold hover:underline cursor-pointer ml-1"
          >
            {isRegistering ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;