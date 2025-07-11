import React from 'react';
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
          {projects.map((project, idx) => (
            <ProjectCard key={idx} project={project} darkMode={darkMode} />
          ))}
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

function ProjectCard({ project, darkMode }) {
  const [showTemplate, setShowTemplate] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [showChallenge, setShowChallenge] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [showSavedMessage, setShowSavedMessage] = React.useState(false);

  const handleToggleSave = async () => {
    try {
      const email = localStorage.getItem('user');
      const endpoint = saved
        ? 'http://localhost:5000/unsave-project'
        : 'http://localhost:5000/save-project';

      const payload = saved
        ? { email, title: project.title }
        : { ...project, email };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setSaved(!saved);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 3000);
      } else {
        alert((saved ? 'Unsave' : 'Save') + ' failed: ' + result.message);
      }
    } catch (error) {
      alert('Something went wrong. Try again.');
      console.error(error);
    }
  };

  return (
    <div className={`relative group rounded-2xl p-5 transition-all duration-300 hover:scale-[1.015] border shadow-lg
      ${darkMode ? 'bg-[#1a002b] backdrop-blur border-white/10 text-white hover:shadow-[0_0_18px_#AD49E1]' : 'bg-white border-gray-300 text-black hover:shadow-[0_0_18px_#AD49E1]'}`}>

      {/* Save Button */}
      <button
        onClick={handleToggleSave}
        className={`absolute top-3 right-3 transition hover:text-[#de92ff] flex items-center gap-1 
          ${darkMode ? 'text-white/70' : 'text-gray-700'}`}
        title={saved ? 'Unsave Project' : 'Save to Profile'}
      >
        {saved ? (
          <FaBookmark size={20} color={darkMode ? '#AD49E1' : '#250035'} />
        ) : (
          <FaRegBookmark size={20} />
        )}
      </button>

      {/* Saved Message */}
      {showSavedMessage && (
        <div className={`absolute top-10 right-3 text-sm font-semibold 
          ${darkMode ? 'text-[#de92ff]' : 'text-[#250035]'}`}>
           Saved
        </div>
      )}

      {/* Title & Description */}
      <h4 className="text-lg font-bold text-[#AD49E1] tracking-wide">{project.title}</h4>
      <p className="mt-2 whitespace-pre-line opacity-90">{project.description}</p>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3 flex-wrap">
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="bg-[#AD49E1] hover:bg-[#de92ff] text-white px-3 py-1 rounded-xl shadow-sm transition font-semibold text-sm"
        >
          {showTemplate ? 'Hide Template' : 'Template'}
        </button>
        <button
          onClick={() => setShowHint(!showHint)}
          className="bg-[#250035] hover:bg-[#3b0050] text-white px-3 py-1 rounded-xl shadow-sm transition font-semibold text-sm"
        >
          {showHint ? 'Hide Hint' : 'Hint'}
        </button>
        {project.challenge && (
          <button
            onClick={() => setShowChallenge(!showChallenge)}
            className="bg-red-700 hover:bg-red-900 text-white px-3 py-1 rounded-xl shadow-sm transition font-semibold text-sm"
          >
            {showChallenge ? 'Hide Challenge' : 'Challenge'}
          </button>
        )}
      </div>

      {/* Template */}
      {showTemplate && (
        <div className={`mt-3 text-sm p-3 rounded-xl whitespace-pre-line border
          ${darkMode ? 'bg-[#3b0066] text-white border-[#AD49E1]/30' : 'bg-purple-100 text-purple-900 border-purple-300'}`}>
          <strong>Reference:</strong> <TemplateLinks template={project.template} />
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className={`mt-3 text-sm p-3 rounded-xl whitespace-pre-line border
          ${darkMode ? 'bg-[#002b1a] text-white border-green-300/20' : 'bg-green-50 text-green-900 border-green-300'}`}>
          <strong>Hint:</strong> {project.hint}
        </div>
      )}

      {/* Challenge */}
      {showChallenge && (
        <div className={`mt-3 text-sm p-3 rounded-xl whitespace-pre-line border
          ${darkMode ? 'bg-[#d59c9c] text-white border-red-300/20' : 'bg-red-100 text-red-900 border-red-300'}`}>
          <strong>Challenge Factor:</strong> {project.challenge}
        </div>
      )}
    </div>
  );
}

function TemplateLinks({ template }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = template.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#de92ff] hover:text-white mr-1 transition"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
