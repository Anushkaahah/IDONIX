import React, { useEffect, useState } from 'react';
import MiniProjectCard from './MiniProjectCard'; // Adjust if the path is different

export default function HistoryProjects({ darkMode }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const email = localStorage.getItem('user');

    if (email && email.includes('@')) {
      fetch(`http://localhost:5000/user-history/${email.trim().toLowerCase()}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const flattened = data.projects.flatMap(entry =>
              entry.projects.map(p => ({
                ...p,
                input_domain: entry.input_domain,
                input_concept: entry.input_concept,
                timestamp: entry.timestamp,
              }))
            );
            setHistory(flattened);
          } else {
            console.error(' Failed to load history');
          }
        })
        .catch(err => console.error(' Error fetching history:', err));
    }
  }, []);

  return (
    <section className={`mt-10 px-4 ${darkMode ? 'text-white' : 'text-black'}`}>
      <h3 className="text-xl font-semibold mb-4"> History (Last 24 hrs)</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {history.length ? (
          history.map((project, idx) => (
            <MiniProjectCard key={idx} project={project} darkMode={darkMode} />
          ))
        ) : (
          <p>No history available.</p>
        )}
      </div>
    </section>
  );
}
