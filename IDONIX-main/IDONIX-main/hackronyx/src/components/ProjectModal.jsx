import React from 'react';
import MiniProjectCard from './MiniProjectCard';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';

export default function ProjectModal({ projects, darkMode, handleFetchProjects, setShowModal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black to-[#250035] bg-opacity-95 px-4">
      <div className={`relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto border p-8 rounded-2xl shadow-[0_0_25px_#AD49E1] backdrop-blur-md
        ${darkMode ? 'bg-[#1a002b]/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className={`absolute top-6 right-5 text-2xl transition hover:text-[#de92ff] 
            ${darkMode ? 'text-white/80' : 'text-gray-600'}`}
          title="Close"
        >
          ✖
        </button>

        {/* Heading */}
        <h3 className="text-3xl font-bold font-serif text-center mb-8 tracking-wide text-[#de92ff] drop-shadow">
          Suggested Projects
        </h3>

        {/* Project Cards */}
        <div className="space-y-6">
          {projects.map((project, idx) => {
            console.log("🔍 Projects received in modal:", project);
            return <MiniProjectCard key={idx} project={project} darkMode={darkMode} />;
          })}
        </div>

        {/* Shuffle Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => {
              setShowModal(false);
              setTimeout(() => handleFetchProjects(true), 300);
            }}
            className="bg-[#AD49E1] hover:bg-[#de92ff] text-white px-6 py-3 rounded-xl shadow-lg transition-all font-semibold tracking-wide"
          >
             Shuffle More Ideas
          </button>
        </div>
      </div>
    </div>
  );
}
