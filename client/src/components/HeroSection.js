import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  const navigate = useNavigate();
  const images = [
  'https://images.unsplash.com/photo-1758691463203-cce9d415b2b5?auto=format&fit=crop&w=900&h=550&q=80',
  'https://images.unsplash.com/photo-1758691463582-11aea602cd4a?auto=format&fit=crop&w=900&h=550&q=80',
  'https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?auto=format&fit=crop&w=900&h=550&q=80',
  'https://images.unsplash.com/photo-1673865641073-4479f93a7776?auto=format&fit=crop&w=900&h=550&q=80',
];


  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const exams = [
    {
      id: 1,
      title: 'USMLE',
      subtitle: 'US Medical Licensing',
      icon: '📋',
      path: 'usmle',
      color: '#4361ee',
      bgColor: 'rgba(67, 97, 238, 0.08)'
    },
    {
      id: 2,
      title: 'PLAB',
      subtitle: 'UK Medical Assessment',
      icon: '🏥',
      path: 'plab',
      color: '#06d6a0',
      bgColor: 'rgba(6, 214, 160, 0.08)'
    },
    {
      id: 3,
      title: 'AMC',
      subtitle: 'Australian Medical Council',
      icon: '🌏',
      path: 'amc',
      color: '#ef476f',
      bgColor: 'rgba(239, 71, 111, 0.08)'
    },
    {
      id: 4,
      title: 'NEET-UG',
      subtitle: 'Indian Medical Entrance',
      icon: '🎯',
      path: 'neet-ug',
      color: '#ff9e00',
      bgColor: 'rgba(255, 158, 0, 0.08)'
    },
    {
      id: 5,
      title: 'MCAT',
      subtitle: 'Medical College Admission',
      icon: '🎓',
      path: 'mcat',
      color: '#7209b7',
      bgColor: 'rgba(114, 9, 183, 0.08)'
    },
    {
      id: 6,
      title: 'MCCQE',
      subtitle: 'Canadian Medical Exam',
      icon: '🍁',
      path: 'mccqe',
      color: '#4895ef',
      bgColor: 'rgba(72, 149, 239, 0.08)'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleExploreExam = (examPath) => {
    navigate(`/exams/${examPath}`);
  };

  const handleSubjectsClick = () => {
    navigate('/subjects');
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        {/* Left Content - Exam Section */}
        <div className="hero-content">
          <div className="hero-badge">
            <span>Trusted by Medical Students Worldwide</span>
          </div>
          
          <h2 className="hero-subtitle">Your Medical Education Partner</h2>
          <h1 className="hero-title">
            Master Your Medical & Licensing Exams with <span className="highlight">Confidence</span>
          </h1>
          
          <p className="hero-description">
            Choose your exam pathway and explore comprehensive study materials, practice questions, 
            and expert guidance tailored for your specific exam requirements.
          </p>
          
          {/* Exams Section - Visible immediately */}
          <div className="hero-exams-section">
            <h3 className="exams-section-title">
              <span className="title-icon">🎯</span>
              Select Your Exam
            </h3>
            <div className="hero-exams-grid">
              {exams.map((exam) => (
                <div 
                  key={exam.id} 
                  className="hero-exam-card"
                  style={{ 
                    '--exam-color': exam.color,
                    '--exam-bg-color': exam.bgColor 
                  }}
                >
                  <div className="exam-icon" style={{ backgroundColor: exam.bgColor }}>
                    <span style={{ color: exam.color }}>{exam.icon}</span>
                  </div>
                  <div className="exam-info">
                    <h3 style={{ color: exam.color }}>{exam.title}</h3>
                    <p>{exam.subtitle}</p>
                  </div>
                  <button 
                    className="exam-explore-btn"
                    onClick={() => handleExploreExam(exam.path)}
                    title={`Explore ${exam.title}`}
                    style={{ 
                      borderColor: exam.color,
                      backgroundColor: 'white' 
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={exam.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Small Image with Subject Button Below */}
        <div className="hero-right-side">
          {/* Small Image Container */}
          <div className="image-container">
            <div 
              className="hero-image-slide"
              style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
            />
            <div className="image-overlay"></div>
            
            {/* Image indicators */}
            <div className="image-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
          </div>

          {/* Modern Subject Button Below Image */}
          <div className="subject-button-modern" onClick={handleSubjectsClick}>
            <div className="subject-button-content">
              <div className="subject-button-icon">
                <span>📖</span>
              </div>
              <div className="subject-button-text">
                <h4>Explore All Subjects</h4>
                <p>Comprehensive study materials for all medical disciplines</p>
              </div>
              <div className="subject-button-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;