import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function LoginModal({ setShowLoginModal, navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', //  Important for session cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
       localStorage.setItem('email', email); // optional if you use it
if (data.user?.first_name) {
  localStorage.setItem('username', data.user.first_name);
  if (response.data.success) {
  localStorage.setItem('username', response.data.user.first_name); // ✅ Save username
  localStorage.setItem('email', response.data.user.email);         // ✅ Save email
  onClose(); // Or redirect
}
}

        setSuccess(' Login successful! ✅');
        toast.success('Welcome back!');
        navigate('/profile');

        setTimeout(() => {
          setShowLoginModal(false);
          navigate('/profile');
        }, 1000);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1e1e1e] text-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center space-y-4">
        <h2 className="text-2xl font-semibold">Log in to your account</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/30 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/30 text-white"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#AD49E1] hover:bg-white text-black py-2 rounded-md font-semibold"
        >
          Log In
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          onClick={() => setShowLoginModal(false)}
          className="text-sm text-gray-400 underline hover:text-white"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
