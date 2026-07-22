import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLABMain.css';

function PLABMain() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 1,
      title: 'What is PLAB?',
      subtitle: 'Understanding the UK Medical Licensing Pathway',
      image: '/images/UK.png',
      color: '#0A2463',
      accentColor: '#2A6EBB',
      path: '/plab/what-is-plab',
      description: 'Complete guide to PLAB exam structure, GMC requirements, eligibility criteria, and registration process for international medical graduates.'
    },
    {
      id: 2,
      title: 'PLAB 1',
      subtitle: 'Written Exam Preparation',
      image: '/images/PLAB1.png',
      color: '#0A2463',
      accentColor: '#3E92CC',
      path: '/plab/plab1',
      description: 'Master the 180 multiple-choice question format with comprehensive study materials, question banks, and proven preparation strategies.',
      buttons: [
        { label: 'Tips to get ready', color: '#2A6EBB', path: '/plab/plab1-tips' },
        { label: 'Theory Bank', color: '#3E92CC', path: '/plab/plab1/theory' },
        { label: 'Tests', color: '#4CA1D5', path: 'tests' },
      ]
    },
    {
      id: 3,
      title: 'PLAB 2',
      subtitle: 'Clinical Skills (OSCE) Preparation',
      image: '/images/Plab2.png',
      color: '#0A2463',
      accentColor: '#4CA1D5',
      path: '/plab/plab2',
      description: 'Prepare for the 16-station OSCE exam with clinical scenario simulations, communication skills training, and practical assessment guidance.',
      notice: 'PLAB 2 Content is currently under active construction by our medical educators. Stay tuned for early access opportunities soon!',
      buttons: [
        { label: 'Theory bank', color: '#2A6EBB', path: '/plab/plab2/theory' },
        { label: 'Guide to PLAB-2', color: '#3E92CC', path: 'guide' },
        { label: 'Pretest scenarios', color: '#4CA1D5', path: 'practice' },
      ]
    },
  ];

  const handleSectionClick = (path) => {
    navigate(path);
  };

  const handleButtonClick = (sectionPath, buttonPath, e) => {
    e.stopPropagation();
    // Check if buttonPath is an absolute path (starts with /)
    if (buttonPath.startsWith('/')) {
      navigate(buttonPath);
    } else {
      navigate(`${sectionPath}/${buttonPath}`);
    }
  };

  return (
    <div className="plab-main">
      <Header />
      
      <div className="plab-main-content">
        {/* Hero Section - Adjusted for proper spacing */}
        <div className="plab-hero-section">
          <div className="plab-hero-overlay">
            <div className="plab-hero-content">
              <h1>Professional and Linguistic Assessments Board (PLAB)</h1>
              <p className="plab-hero-subtitle">UK Medical Licensing Examination for International Medical Graduates</p>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="plab-unified-container">
          <div className="plab-unified-content">
            <h2 className="section-title">PLAB Exam Preparation</h2>
            <p className="section-subtitle">Comprehensive resources for PLAB 1 & PLAB 2 success</p>
            
            {/* Sections Grid */}
            <div className="plab-sections-grid">
              {sections.map((section) => {
                const isClickable = !section.buttons;
                return (
                  <div 
                    key={section.id} 
                    className={`plab-section-card ${isClickable ? 'clickable' : ''}`}
                    onClick={isClickable ? () => handleSectionClick(section.path) : undefined}
                    style={{ 
                      borderLeft: `4px solid ${section.accentColor}`,
                      borderTop: `3px solid ${section.color}`
                    }}
                  >
                  <div className="plab-card-header" style={{ 
                    backgroundColor: section.color,
                    borderBottom: `2px solid ${section.accentColor}`
                  }}>
                    <div className="card-icon" style={{ 
                      backgroundColor: `${section.accentColor}40`,
                      color: section.accentColor
                    }}>
                      {section.id === 1 && '📋'}
                      {section.id === 2 && '📝'}
                      {section.id === 3 && '🏥'}
                    </div>
                    <div className="card-title-container">
                      <h3>{section.title}</h3>
                      <p className="card-subtitle">{section.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="plab-section-image">
                    <img src={section.image} alt={section.title} />
                    <div className="image-overlay" style={{ 
                      background: `linear-gradient(to bottom, transparent 50%, ${section.color}15)`
                    }}></div>
                  </div>
                  
                  <div className="plab-card-content">
                    <p>{section.description}</p>
                  </div>

                  {section.notice && (
                    <div className="plab-card-notice">
                      <p>{section.notice}</p>
                    </div>
                  )}
                  
                  {section.buttons && (
                    <div className="plab-section-buttons">
                      {section.buttons.map((button, index) => (
                        <button 
                          key={index}
                          className="plab-button"
                          style={{ 
                            backgroundColor: button.color,
                            color: 'white'
                          }}
                          onClick={(e) => handleButtonClick(section.path, button.path, e)}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            </div>

            {/* Info Cards */}
            <div className="plab-info-section">
              <div className="info-card" style={{ borderTop: '3px solid #0A2463' }}>
                <div className="info-icon" style={{ color: '#0A2463' }}>🎯</div>
                <h3>Exam Format</h3>
                <p>PLAB 1: 180 MCQs (3 hours) | PLAB 2: 16 OSCE stations</p>
              </div>
              <div className="info-card" style={{ borderTop: '3px solid #2A6EBB' }}>
                <div className="info-icon" style={{ color: '#2A6EBB' }}>📅</div>
                <h3>Test Centers</h3>
                <p>PLAB 1: Global locations | PLAB 2: Manchester, UK only</p>
              </div>
              <div className="info-card" style={{ borderTop: '3px solid #3E92CC' }}>
                <div className="info-icon" style={{ color: '#3E92CC' }}>✅</div>
                <h3>Pass Rates</h3>
                <p>Average pass rates: PLAB 1 (70%) | PLAB 2 (67%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PLABMain;