import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Tips.css';

function PLAB1Tips() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlab1TipsContent();
  }, []);

  const fetchPlab1TipsContent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plab-content/plab1-tips');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
      } else {
        setError('Failed to load content');
      }
    } catch (err) {
      console.error('Error fetching PLAB 1 Tips content:', err);
      setError('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="plab1-tips">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="plab1-tips">
        <Header />
        <div className="error-container">
          <p>{error || 'Content not found'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="plab1-tips">
      <Header />
      
      {/* Hero Section */}
      <div className="tips-hero">
        <div className="tips-hero-content">
          <div className="checkmark-icon">✓</div>
          <h1>{content.title}</h1>
          <p className="tips-subtitle">{content.subtitle}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="tips-nav-buttons">
        <button className="tips-nav-btn theory-btn" onClick={() => navigate('/plab/plab1/theory')}>
          Theory Bank
        </button>
        <button className="tips-nav-btn tests-btn" onClick={() => navigate('/plab/plab1/tests')}>
          Tests
        </button>
      </div>

      {/* Tips Content */}
      <div className="tips-container">
        {content.sections && content.sections.length > 0 && (
          <div className="tips-sections">
            {content.sections.sort((a, b) => a.order - b.order).map((section, index) => (
              <div key={section._id} className="tip-section">
                <h2 className="tip-heading">{section.heading}</h2>
                <div className="tip-content">
                  {section.content.split('\n').map((line, i) => {
                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                      return (
                        <div key={i} className="tip-bullet">
                          <span className="bullet-point">•</span>
                          <span>{line.replace(/^[•\-]\s*/, '')}</span>
                        </div>
                      );
                    } else if (line.trim()) {
                      return <p key={i} className="tip-text">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default PLAB1Tips;
