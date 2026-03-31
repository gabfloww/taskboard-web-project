import React, { useState, useEffect } from 'react';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(r => r.json())
      .then(() => setApiStatus('✅ API Connected'))
      .catch(e => setApiStatus('❌ API Error: ' + e.message));

    // Fetch columns
    fetch('/api/columns')
      .then(r => r.json())
      .then(data => {
        setColumns(data || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleAddColumn = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const col = await res.json();
      setColumns([...columns, col]);
      setTitle('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>TaskBoard</h1>
      <p style={{ fontSize: '18px' }}>{apiStatus}</p>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New column title"
              style={{ padding: '8px', marginRight: '8px' }}
            />
            <button onClick={handleAddColumn} style={{ padding: '8px 16px' }}>
              Add Column
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {columns.map((col) => (
              <div key={col.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: col.color ? col.color + '20' : '#f3f4f6' }}>
                <h2>{col.title}</h2>
                <p>{col.tasks?.length || 0} tasks</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
