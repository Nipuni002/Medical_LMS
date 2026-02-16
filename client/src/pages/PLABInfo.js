import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLABInfo.css';

function PLABInfo() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlabContent();
  }, []);

  const fetchPlabContent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plab-content/what-is-plab');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
      } else {
        setError('Failed to load content');
      }
    } catch (err) {
      console.error('Error fetching PLAB content:', err);
      setError('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="plab-info">
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
      <div className="plab-info">
        <Header />
        <div className="error-container">
          <p>{error || 'Content not found'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="plab-info">
      <Header />
      
      {/* Compact Hero */}
      <div className="plab-info-compact-hero">
        <div className="compact-hero-content">
          <h1>{content.title}</h1>
          <p className="compact-hero-subtitle">{content.subtitle}</p>
        </div>
      </div>

      {/* Main Content - All in one view */}
      <div className="plab-info-compact-container">

        {/* Dynamic Sections */}
        {content.sections && content.sections.length > 0 && (
          <div className="content-sections">
            {content.sections.sort((a, b) => a.order - b.order).map((section) => (
              <div key={section._id} className="content-section-card">
                <h3 className="section-heading">{section.heading}</h3>
                <p className="section-content">{section.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default PLABInfo;
