import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Tips.css';

function PLAB1Tips() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sanitizeTipHtml = (html = '') => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('script, iframe, object, embed').forEach((node) => node.remove());
    doc.querySelectorAll('*').forEach((node) => {
      [...node.attributes].forEach((attr) => {
        if (attr.name.startsWith('on')) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  useEffect(() => {
    fetchPlab1TipsContent();
  }, []);

  const fetchPlab1TipsContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plab-content/plab1-tips`);
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



      {/* Tips Content */}
      <div className="tips-container">
        {content.sections && content.sections.length > 0 && (
          <div className="tips-sections">
            {[...content.sections].sort((a, b) => a.order - b.order).map((section) => (
              <div key={section._id} className="tip-section">
                <h2 className="tip-heading">{section.heading}</h2>
                <div
                  className="tip-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeTipHtml(section.content || '') }}
                />
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
