import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ darkMode, userInfo, onProfileClick }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (userInfo && userInfo.email) {
      navigate('/profile');
    } else {
      onProfileClick(); // triggers login/signup modal from parent
    }
  };

  return (
    
<header className={`fixed top-0 left-0 w-full z-30 bg-transparent transition duration-300 ${darkMode ? 'text-white' : 'text-black'}`}>
      <div className="container font-bold mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="text-2xl font-serif tracking-wide">
          <span className="text-[#CBA8FF]">IDO</span>NIX
        </div>

        {/* Navigation Links */}
        <nav className="flex space-x-6 text-sm font-medium items-center">
          <a href="#" className="hover:text-[#CBA8FF] transition">Help</a>
          <a href="#" className="hover:text-[#CBA8FF] transition">About Us</a>
          <a href="#" className="hover:text-[#CBA8FF] transition">Support</a>

          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className="p-2 rounded-full shadow bg-white text-black hover:scale-110 transition"
          >
            <FaUserCircle size={22} />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
