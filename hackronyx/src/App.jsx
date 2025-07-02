import React, { useState, useEffect } from 'react';
import { FaRobot, FaSun, FaMoon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProjectModal from './components/ProjectModal';
import SignupModal from './components/SignupModal';
import LoginModal from './components/LoginModal';
import SavedProjects from './components/SavedProjects';
import HistoryProjects from './components/HistoryProjects';
import { Toaster } from 'react-hot-toast';
import InteractiveChatInput from './components/InteractiveChatInput';

export default function AIProjectGenerator() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [combineConcepts, setCombineConcepts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [historyProjects, setHistoryProjects] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.loggedIn) {
          setIsAuthenticated(true);
          fetch('http://localhost:5000/user/session', {
            credentials: 'include'
          }).then(res => res.json()).then(data => {
            if (data.success) setUserInfo(data.user);
          });

          fetch('http://localhost:5000/saved-projects/session', {
            credentials: 'include'
          }).then(res => res.json()).then(data => {
            if (data.success) setSavedProjects(data.projects);
          });

          fetch('http://localhost:5000/history-projects/session', {
            credentials: 'include'
          }).then(res => res.json()).then(data => {
            if (data.success) setHistoryProjects(data.projects);
          });
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, []);

  

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/particles.js';
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS.load('particles-js', '/assets/particles.json', () => {
          console.log('Particles.js config loaded');
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const fetchProjects = async (concept, domain, transcript, skillLevel, previousConcepts = []) => {
    setLoading(true);
    setError('');
    setProjects([]);

    try {
      const response = await fetch('http://localhost:5000/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          concept,
          previous_concepts: previousConcepts.join(', '),
          domain,
          transcript,
          skill_level: skillLevel,
        }),
      });

      const data = await response.json();
      if (response.ok && data.projects?.length > 0) {
        setProjects(data.projects);
        setShowModal(true);
      } else {
        setError(data.error || ' No project ideas returned.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(' Failed to fetch from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConcept = async () => {
    const email = userInfo?.email;
    if (!email) return;

    try {
      const response = await fetch('http://localhost:5000/save-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, concept, domain }),
      });

      const data = await response.json();
      if (!data.success) {
        console.warn(" Concept not saved:", data.message);
      } else {
        console.log(" Concept saved");
      }
    } catch (err) {
      console.error(" Error saving concept:", err);
    }
  };

  const handleFetchProjects = async () => {
    if (!concept || !skillLevel || !domain) {
      setError('Please fill all required fields.');
      return;
    }
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await handleSaveConcept();
      console.log(" Current concept saved:", concept);
    } catch (err) {
      console.warn(" Concept save failed but continuing with generation.");
    }

    let previousConcepts = [];

    if (combineConcepts) {
      try {
        const res = await fetch("http://localhost:5000/get-concepts", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          previousConcepts = data.concepts.filter(c => c !== concept);
          console.log(" Previous concepts (excluding current):", previousConcepts);
        } else {
          console.warn(" Could not fetch previous concepts:", data.message);
        }
      } catch (err) {
        console.warn(" Failed to fetch previous concepts.", err);
      }
    } else {
      console.log(" Combine toggle is OFF. Using only current concept.");
    }

    console.log(" Calling fetchProjects with:", {
      concept,
      previousConcepts,
      domain,
      skillLevel,
      transcript
    });

    fetchProjects(concept, domain, transcript, skillLevel, previousConcepts);
  };

  const handleTypingCheck = () => {
    if (!isAuthenticated && !hasStartedTyping) {
      setHasStartedTyping(true);
      setShowLoginPrompt(true);
    }
  };

  const handleRequireAuth = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    }
  };

  return (
    <>
<style>{`
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(to bottom, #250035, #000000);
      overflow-x: hidden;
    }
    #particles-js {
      position: fixed !important;
      width: 100vw;
      height: 100vh;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: auto !important;
    }
    #particles-js canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: transparent !important;
      z-index: 0 !important;
    }
  `}</style>

  <div id="particles-js"></div>

  <div className="relative z-10">
    <Navbar darkMode={darkMode} userInfo={userInfo} setShowLoginPrompt={setShowLoginPrompt} onProfileClick={handleRequireAuth} />
    <Toaster position="top-right" />

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1e1e1e] text-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
            <p className="text-sm text-gray-300 mb-6">
              Log in or sign up to get smarter project ideas and extra features
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setShowLoginModal(true);
                }}
                className="bg-[#AD49E1] text-black hover:bg-white  py-2 rounded-full font-semibold hover:scale-105 transition-all"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setShowSignupModal(true);
                }}
                className="border border-gray-400 text-white py-2 rounded-full font-semibold hover:bg-gray-800 transition"
              >
                Sign up for free
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setLoginTriggered(false);
                }}
                className="text-sm text-gray-400 underline hover:text-white"
              >
                Stay logged out
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <LoginModal setShowLoginModal={setShowLoginModal} navigate={navigate} />
      )}

      {showSignupModal && (
        <SignupModal setShowSignupModal={setShowSignupModal} navigate={navigate} />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-center items-center text-white text-xl">
          <div className="w-10 h-10 border-4 border-[#de92ff] border-dashed rounded-full animate-spin"></div>
          <p className="mt-3 animate-pulse">Thinking...</p>
        </div>
      )}

      {showModal && (
        <ProjectModal
          projects={projects}
          darkMode={darkMode}
          handleFetchProjects={handleFetchProjects}
          setShowModal={setShowModal}
        />
      )}


<div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden mt-[100px] px-4">

  {/* Top-right slot if needed */}
  <div className="absolute top-5 right-5 z-20" />

  {/* Chatbot box directly below it */}
  <div className="z-10 w-full max-w-4xl animate-fadeInUp">
          <InteractiveChatInput
        darkMode={darkMode}
        onProjectsGenerated={(projects) => {
          setProjects(projects);
          setShowModal(true);
        }}
      />
  </div>
</div>

      </div>
    </>
  );
}
