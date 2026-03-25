import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <h1 style={{ color: 'var(--primary-orange)' }}>Mini mart agent</h1>
      <p style={{ marginBottom: '2rem' }}>Helper Agent To Help You Shop</p>
      <button 
        onClick={() => navigate('/chat')}
        style={{
          padding: '12px 24px',
          fontSize: '18px',
          backgroundColor: 'var(--primary-orange)',
          color: 'var(--secondary-white)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        Begin Conversation
      </button>
    </div>
  );
};

export default Home;
