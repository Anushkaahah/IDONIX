import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SavedProjects from './SavedProjects';
import HistoryProjects from './HistoryProjects';
import { UserRoundPen, StickyNote, Save, ClipboardMinus, LogOut, Proportions } from 'lucide-react';


const Profile = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [userInfo, setUserInfo] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]); //  Add this
  const [myProjects, setMyProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', github: '' });
  const [historyData, setHistoryData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

    const handleProfileUpdate = () => {
  fetch('http://localhost:5000/update-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', //  needed for session
    body: JSON.stringify({
      profession: userInfo.profession,
      skill_level: userInfo.skill_level,
      skills: userInfo.skills,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert(' Profile updated successfully! ✅');
      } else {
        alert(' Failed to update profile. ❌');
      }
    })
    .catch((err) => {
      console.error('Error updating profile:', err);
      alert(' Server error.');
    });
};
const handleMarkCompleted = (title) => {
  fetch('http://localhost:5000/unsave-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: userInfo?.email,
      title: title,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setSavedProjects((prev) => prev.filter((proj) => proj.title !== title));
        alert('Project marked as completed and removed.');
      } else {
        alert('Failed to remove project.');
      }
    })
    .catch((err) => {
      console.error('Error marking project complete:', err);
      alert('Server error.');
    });
};


  useEffect(() => {
    fetch('http://localhost:5000/check-auth', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (!data.loggedIn) {
          navigate('/');
        }
      })
      .catch(err => {
        console.error('Error checking auth status:', err);
        navigate('/');
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/user/session', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserInfo(data.user);
        }
      })
      .catch(err => console.error('Failed to load user info:', err));
  }, []);

  useEffect(() => {
  const email = localStorage.getItem('user');
  if (email && email.includes('@')) {
    fetch(`http://localhost:5000/user-history/${email.trim().toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistoryData(data.projects); // this assumes you're using historyData in JSX
        } else {
          console.error('Failed to load history');
        }
      })
      .catch(err => console.error('Error fetching history:', err));
  }
}, []);


  useEffect(() => {
    fetch('http://localhost:5000/saved-projects/session', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log("Saved Projects Fetched:", data);
        if (data.success) setSavedProjects(data.projects);
        else console.error('Failed to load saved projects');
      })
      .catch(err => console.error('Error fetching saved projects:', err));
  }, []);

//  useEffect(() => {
//    fetch('http://localhost:5000/my-projects/session', {
//      method: 'GET',
//      credentials: 'include',
//    })
//      .then(res => res.json())
//      .then(data => {
//        if (data.success) setMyProjects(data.projects);
//      })
//      .catch(err => console.error('Error fetching My Projects:', err));
//  }, []);

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.description || !newProject.github) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/add-my-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProject)
      });

      const data = await res.json();

      if (data.success) {
        setMyProjects(prev => [...prev, newProject]);
        setNewProject({ title: '', description: '', github: '' });
      } else {
        alert('Failed to add project.');
      }
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        navigate('/');
      } else {
        alert('Logout failed');
      }
    } catch (err) {
      console.error('Error logging out:', err);
      alert('Logout failed');
    }
  };

  const renderContent = () => {
    const cardBase = 'bg-[#250035] text-white p-5 rounded-xl shadow-md';

    switch (activeTab) {
      case 'Profile':
  return (
    <div className="space-y-8">
      <div className="bg-[#250035] text-white p-8 rounded-xl shadow-md w-full">
        <h2 className="text-2xl font-bold mb-6">Personal Info</h2>

        <div className="space-y-3 text-lg">
          <p><strong>Name:</strong> {userInfo?.username || 'N/A'}</p>
          <p><strong>Email:</strong> {userInfo?.email || 'N/A'}</p>

          <p><strong>Skill Level:</strong>
            {isEditing ? (
              <select
                className="ml-2 bg-black text-white p-1 rounded"
                value={userInfo?.skill_level || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, skill_level: e.target.value }))
                }
              >
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            ) : (
              <span className="ml-2">{userInfo?.skill_level || 'N/A'}</span>
            )}
          </p>

          <p><strong>Profession:</strong>
            {isEditing ? (
              <select
                className="ml-2 bg-black text-white p-1 rounded"
                value={userInfo?.profession || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, profession: e.target.value }))
                }
              >
                <option value="">Select</option>
                <option value="Student">Student</option>
                <option value="Engineer">Engineer</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Entrepreneur">Entrepreneur</option>
              </select>
            ) : (
              <span className="ml-2">{userInfo?.profession || 'N/A'}</span>
            )}
          </p>

          <p><strong>Skills:</strong>
            {isEditing ? (
              <input
                type="text"
                className="ml-2 bg-black text-white p-1 rounded"
                placeholder="e.g., HTML, CSS, JavaScript"
                value={userInfo?.skills || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, skills: e.target.value }))
                }
              />
            ) : (
              <span className="ml-2">{userInfo?.skills || 'N/A'}</span>
            )}
          </p>
        </div>

        <div className="mt-4 space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#E6E6FA] hover:bg-[#d8d8f0] text-black px-6 py-2 rounded-md font-semibold"
            >
              Update Profile
            </button>
          ) : (
            <button
              onClick={() => {
                handleProfileUpdate();
                setIsEditing(false);
              }}
              className="bg-[#E6E6FA] hover:bg-[#d8d8f0] text-black px-6 py-2 rounded-md font-semibold"
            >
              Save Profile
            </button>
          )}
        </div>
      
            </div>

            {/* Add To-Do list here */}
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-2">📝 To-Do Projects</h3>
          {savedProjects.length ? (
            <ul className="space-y-3">
              {savedProjects.map((proj, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white/10 border border-white/20 p-3 rounded-lg">
                  <span>{proj.title}</span>
                  <button
                    onClick={() => handleMarkCompleted(proj.title)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Completed
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No saved projects in to-do list.</p>
          )}
        </div>
      </div>
  
  );
      case 'Saved Projects':
        return <SavedProjects darkMode={true} />;

      case 'My Projects':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Projects You've Completed</h2>
            <p className="text-gray-300">Explore your progress and saved ideas</p>

            <div className="bg-[#250035] p-4 rounded-xl shadow-md space-y-3">
              <h3 className="text-lg font-semibold">Add a Project</h3>
              <input
                type="text"
                placeholder="Project Title"
                className="w-full p-2 rounded bg-black text-white"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Brief Description"
                className="w-full p-2 rounded bg-black text-white"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="GitHub Repository Link"
                className="w-full p-2 rounded bg-black text-white"
                value={newProject.github}
                onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
              />
              <button
                className="bg-[#AD49E1] text-white px-4 py-2 rounded-full hover:brightness-110 transition"
                onClick={handleAddProject}
              >
                Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.length ? myProjects.map((proj, i) => (
                <div key={i} className="bg-[#250035] text-white p-5 rounded-xl shadow-md">
                  <h4 className="font-bold text-lg">{proj.title}</h4>
                  <p className="text-sm text-gray-300">{proj.description}</p>
                  <a href={proj.github} target="_blank" rel="noopener noreferrer" className="text-sm text-[#AD49E1] underline mt-1 block">
                    GitHub Repo
                  </a>
                </div>
              )) : (
                <p className="text-sm text-gray-400">No projects added yet.</p>
              )}
            </div>
          </div>
        );

      case 'History':
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project History</h2>
      <p className="text-gray-300">These are your previously generated ideas</p>
      <HistoryProjects darkMode={true} />
    </div>
  );

      default:
        return null;
    }
  };

const tabs = [
  { label: 'Profile', icon: <UserRoundPen className="w-5 h-5" /> },
  { label: 'My Projects', icon: <StickyNote className="w-5 h-5" /> },
  { label: 'Saved Projects', icon: <Save className="w-5 h-5" /> },
  { label: 'History', icon: <ClipboardMinus className="w-5 h-5" /> },
];
  return (
    <div className="h-screen flex flex-col bg-[#1a001f] text-white">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 p-6 border-r border-[#AD49E1] bg-[#250035] flex flex-col items-center">
          <div className="flex items-start gap-3 mb-4 self-start">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-[#AD49E1] transition mt-2"
              title="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <FaUserCircle size={50} className="text-white" />
              {userInfo && (
                <>
                  <p className="mt-1 text-sm text-white font-medium">{userInfo.username}</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeTab === tab.label ? 'bg-[#AD49E1] text-white font-semibold' : 'hover:bg-black'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-6 border-t border-white/10 w-full">
            <button
              onClick={handleLogout}
            className="w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg transition duration-200 hover:bg-black text-white"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            </div>

        </div>

        <div className="flex-1 p-10 overflow-auto bg-[#1a001f]">
          <h1 className="text-3xl font-bold mb-6">{activeTab}</h1>
          <div className="relative bg-black/40 backdrop-blur-md text-white rounded-2xl shadow-2xl p-6 border border-white/10">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
