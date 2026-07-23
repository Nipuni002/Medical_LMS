import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB2Locked.css';

function PLAB2Locked() {
  const navigate = useNavigate();

  return (
    <div className="plab2-locked-page">
      <Header />
      
      <main className="plab2-locked-container">
        <div className="plab2-locked-card">
          <div className="lock-icon-container">
            <svg 
              className="lock-svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          
          <h1 className="locked-title">PLAB 2 Lab is Temporarily Locked</h1>
          <p className="locked-subtitle">Clinical Skills (OSCE) Preparation</p>
          
          <div className="locked-divider"></div>
          
          <p className="locked-description">
            This section is currently locked for maintenance and content updates. 
            Our medical educators are working to update OSCE scenarios, theory banks, and communication skills guides.
          </p>
          
          <div className="locked-notice-box">
            <span className="notice-icon">💡</span>
            <p>We are preparing new, interactive PLAB 2 content to help you succeed in your clinical exams. Stay tuned for early access soon!</p>
          </div>
          
          <button 
            className="back-to-plab-btn" 
            onClick={() => navigate('/exams/plab')}
          >
            ← Back to PLAB Dashboard
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default PLAB2Locked;
