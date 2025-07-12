import React, { useEffect, useState } from 'react';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiniProjectCard({ project, darkMode }) {
    if (!project || typeof project !== 'object') {
    console.error("❌ Invalid project prop:", project);
    return null;
  }
  
  console.log("🟢 MiniProjectCard rendering project:", project);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem('user');
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = project.template?.split(urlRegex) || [];

  useEffect(() => {
    if (!email || !project.title) return;
    fetch(`http://localhost:5000/saved-projects/session`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("🧪 Project title:", project.title);
          const found = data.projects.some(p => p.title === project.title);
          setSaved(found);
        }
      });
  }, [email, project.title]);

  const handleToggleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const url = saved
        ? 'http://localhost:5000/unsave-project'
        : 'http://localhost:5000/save-project';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(saved ? { email, title: project.title } : { ...project, email }),
      });

      const result = await res.json();
      if (result.success) setSaved(!saved);
      else alert(`${saved ? 'Unsave' : 'Save'} failed: ${result.message}`);
    } catch (err) {
      console.error(`${saved ? 'Unsave' : 'Save'} error:`, err);
    }

    setLoading(false);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-2xl transition-all border backdrop-blur-md shadow-xl
        ${
          darkMode
            ? 'bg-white/5 border-white/10 text-white hover:shadow-[0_0_15px_#AD49E1]'
            : 'bg-white/70 border-gray-300 text-black hover:shadow-[0_0_15px_#AD49E1]'
        }`}
    >
      {/* Bookmark */}
      <button
        onClick={handleToggleSave}
        className="absolute top-3 right-3 transition hover:scale-110 bg-white/20 backdrop-blur p-1 rounded-full"
        title={saved ? 'Unsave' : 'Save'}
        disabled={loading}
      >
        {saved ? (
          <FaBookmark size={18} color={darkMode ? '#AD49E1' : '#250035'} />
        ) : (
          <FaRegBookmark size={18} color={darkMode ? '#AD49E1' : 'black'} />
        )}
      </button>

      <h4 className="text-md font-bold text-[#AD49E1] mb-1 tracking-wide">{project.title}</h4>
      <p className="text-sm opacity-80 mb-1 whitespace-pre-line">
        {project.description || 'No description.'}
      </p>
      <p className="text-xs opacity-60 mb-2">Domain: {project.input_domain || 'N/A'}</p>

      {/* Buttons */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {project.template && (
          <button
            onClick={() => setShowTemplate(!showTemplate)}
            className="text-xs px-3 py-1 rounded-xl font-semibold transition 
              bg-[#AD49E1] hover:bg-[#de92ff] text-white shadow-md"
          >
            {showTemplate ? 'Hide Template' : 'Show Template'}
          </button>
        )}
        {project.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs px-3 py-1 rounded-xl font-semibold transition 
              bg-[#250035] hover:bg-[#3b0050] text-white shadow-md"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        )}
        {project.challenge && (
          <button
            onClick={() => setShowChallenge(!showChallenge)}
            className="text-xs px-3 py-1 rounded-xl font-semibold transition 
              bg-red-700 hover:bg-red-900 text-white shadow-md"
          >
            {showChallenge ? 'Hide Challenge' : 'Show Challenge'}
          </button>
        )}
      </div>

      {/* Template Section */}
      <AnimatePresence>
        {showTemplate && project.template && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-2 text-xs rounded-md p-3 border whitespace-pre-line overflow-hidden 
              ${darkMode ? 'bg-[#2e004c] text-white border-[#AD49E1]/30' : 'bg-purple-100 text-purple-900 border-purple-300'}`}
          >
            <strong className="text-[#AD49E1]">Template:</strong>{' '}
            {parts.map((part, i) =>
              urlRegex.test(part) ? (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#de92ff] hover:text-white mr-1"
                >
                  {part}
                </a>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Section */}
      <AnimatePresence>
        {showHint && project.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-2 text-xs rounded-md p-3 border whitespace-pre-line overflow-hidden 
              ${darkMode ? 'bg-[#00331f] text-green-100 border-green-400/10' : 'bg-green-100 text-green-900 border-green-300'}`}
          >
            <strong className="text-green-400">Hint:</strong> {project.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Section */}
      <AnimatePresence>
        {showChallenge && project.challenge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-2 text-xs rounded-md p-3 border whitespace-pre-line overflow-hidden 
              ${darkMode ? 'bg-[#330000] text-red-200 border-red-500/10' : 'bg-red-100 text-red-900 border-red-300'}`}
          >
            <strong className="text-red-500">Challenge Factor:</strong> {project.challenge}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
