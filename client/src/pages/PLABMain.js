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
      subtitle: 'Professional and Linguistic Assessments Board',
      image: '/images/PLAB.png',
      color: '#0A2463', // Dark blue
      accentColor: '#3E92CC', // Light blue
      path: '/plab/what-is-plab'
    },
    {
      id: 2,
      title: 'Tips to get ready',
      subtitle: 'Complete Guidance, Tips and Tricks',
      image: '/images/tips.png',
      color: '#0A2463',
      accentColor: '#3E92CC',
      path: '/plab/tips'
    },
    {
      id: 3,
      title: 'Theory Bank',
      subtitle: 'Comprehensive Study Materials',
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      color: '#0A2463',
      accentColor: '#3E92CC',
      path: '/plab/theory-bank'
    },
    {
      id: 4,
      title: 'Question Bank',
      subtitle: 'Practice Questions for PLAB-1 & PLAB-2',
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80',
      color: '#0A2463',
      accentColor: '#3E92CC',
      path: '/plab/question-bank',
      buttons: [
        { label: 'PLAB-1', color: '#3c72e7', path: 'plab-1' },
        { label: 'PLAB-2', color: '#16A085', path: 'plab-2' }
      ]
    }
  ];

  const handleSectionClick = (path) => {
    navigate(path);
  };

  const handleButtonClick = (sectionPath, buttonPath, e) => {
    e.stopPropagation();
    navigate(`${sectionPath}/${buttonPath}`);
  };

  return (
    <div className="plab-main">
      <Header />
      
      <div className="plab-main-content">
        {/* Hero Section */}
        <div className="plab-hero-section">
          <div className="plab-hero-overlay">
            <div className="plab-hero-content">
              <h1>Professional and Linguistic Assessments Board (PLAB)</h1>
              <p className="plab-hero-subtitle">The UK medical licensing examination for international doctors</p>
              
            </div>
          </div>
        </div>

        {/* Main Content Container - Everything in one view */}
        <div className="plab-unified-container">
          <div className="plab-unified-content">
            <h2 className="section-title">PLAB Exam Resources</h2>
            <p className="section-subtitle">Everything you need to prepare for the PLAB exams</p>
            
            {/* Sections Grid */}
            <div className="plab-sections-grid">
              {sections.map((section) => (
                <div 
                  key={section.id} 
                  className="plab-section-card"
                  onClick={() => handleSectionClick(section.path)}
                  style={{ '--accent-color': section.accentColor }}
                >
                  <div className="plab-card-header" style={{ backgroundColor: section.color }}>
                    <div className="card-icon">
                      {section.id === 1 && '📋'}
                      {section.id === 2 && '💡'}
                      {section.id === 3 && '📚'}
                      {section.id === 4 && '❓'}
                    </div>
                    <div className="card-title-container">
                      <h3>{section.title}</h3>
                      <p className="card-subtitle">{section.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="plab-section-image">
                    <img src={section.image} alt={section.title} />
                    <div className="image-overlay"></div>
                  </div>
                  
                  <div className="plab-card-content">
                    {section.id === 1 && (
                      <p>Learn about the PLAB exam structure, requirements, and registration process for practicing medicine in the UK.</p>
                    )}
                    {section.id === 2 && (
                      <p>Essential strategies, study plans, and practical advice to maximize your preparation efficiency.</p>
                    )}
                    {section.id === 3 && (
                      <p>Comprehensive study materials covering all topics tested in the PLAB exams.</p>
                    )}
                    {section.id === 4 && (
                      <p>Practice with thousands of questions from previous PLAB exams to test your knowledge.</p>
                    )}
                  </div>
                  
                  {section.buttons ? (
                    <div className="plab-section-buttons">
                      {section.buttons.map((button, index) => (
                        <button 
                          key={index}
                          className="plab-button"
                          style={{ 
                            backgroundColor: button.color,
                            border: `2px solid ${section.color}`
                          }}
                          onClick={(e) => handleButtonClick(section.path, button.path, e)}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="plab-section-action">
                      <button 
                        className="plab-action-button"
                        style={{ backgroundColor: section.color }}
                        onClick={() => handleSectionClick(section.path)}
                      >
                        Explore
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info Cards */}
            <div className="plab-info-section">
              <div className="info-card" style={{ borderTop: '4px solid #0A2463' }}>
                <div className="info-icon" style={{ color: '#0A2463' }}>🎯</div>
                <h3>Exam Structure</h3>
                <p>PLAB consists of two parts: PLAB-1 (written exam) and PLAB-2 (practical OSCE exam).</p>
              </div>
              <div className="info-card" style={{ borderTop: '4px solid #2A6EBB' }}>
                <div className="info-icon" style={{ color: '#2A6EBB' }}>📅</div>
                <h3>Exam Dates</h3>
                <p>PLAB-1 is held four times a year globally. PLAB-2 runs throughout the year in the UK.</p>
              </div>
              <div className="info-card" style={{ borderTop: '4px solid #4CA1D5' }}>
                <div className="info-icon" style={{ color: '#4CA1D5' }}>✅</div>
                <h3>Eligibility</h3>
                <p>You must have a primary medical qualification and the necessary English language skills.</p>
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