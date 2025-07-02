import React, { useEffect, useState } from 'react';
import MiniProjectCard from './MiniProjectCard';

export default function SavedProjects({ darkMode }) {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/saved-projects/session', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSaved(data.projects);
        else console.error('Failed to load saved projects');
      })
      .catch(err => console.error('Error fetching saved projects:', err));
  }, []);

  return (
    <section className={`mt-10 px-4 ${darkMode ? 'text-white' : 'text-black'}`}>
      <h3 className="text-xl font-semibold mb-4">Saved Projects</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {saved.length ? (
          saved.map((project, idx) => (
            <MiniProjectCard key={idx} project={project} darkMode={darkMode} />
          ))
        ) : (
          <p>No saved projects yet.</p>
        )}
      </div>
    </section>
  );
}
