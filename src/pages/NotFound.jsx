import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <h1 style={{ color: 'var(--primary-orange)', fontSize: '3rem', margin: '0 0 1rem 0' }}>404</h1>
      <h2 style={{ color: 'var(--text-dark)' }}>Masi Proses Boss</h2>
      <button 
        onClick={() => navigate('/')}
        style={{ marginTop: '2rem', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: 'var(--secondary-white)', border: '1px solid #ccc' }}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
