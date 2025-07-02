import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function SignupModal({ setShowSignupModal, navigate }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !firstName || !lastName || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', //  Important for session cookie
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('email', email); // optional if you use it
if (data.user?.first_name) {
  localStorage.setItem('username', data.user.first_name);
  if (response.data.success) {
  localStorage.setItem('username', response.data.user.first_name); // ✅ Save username
  localStorage.setItem('email', response.data.user.email);         // ✅ Save email
  onClose(); // Or redirect
}
}

        setShowSignupModal(false);
        toast.success('Signup successful!');
        navigate('/profile');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1e1e1e] text-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center space-y-4">
        <h2 className="text-2xl font-semibold">Create your account</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/30 text-white"
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/30 text-white"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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
          onClick={handleSignup}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
        >
          Sign Up
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={() => setShowSignupModal(false)}
          className="text-sm text-gray-400 underline hover:text-white"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
