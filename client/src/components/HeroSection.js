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
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      path: 'usmle',
      color: '#4361ee',
      bgColor: 'rgba(67, 97, 238, 0.1)'
    },
    {
      id: 2,
      title: 'PLAB',
      subtitle: 'UK Medical Assessment',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      path: 'plab',
      color: '#06d6a0',
      bgColor: 'rgba(6, 214, 160, 0.1)'
    },
    {
      id: 3,
      title: 'AMC',
      subtitle: 'Australian Medical Council',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      path: 'amc',
      color: '#ef476f',
      bgColor: 'rgba(239, 71, 111, 0.1)'
    },
    {
      id: 4,
      title: 'NEET-UG',
      subtitle: 'Indian Medical Entrance',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      path: 'neet-ug',
      color: '#ff9e00',
      bgColor: 'rgba(255, 158, 0, 0.1)'
    },
    {
      id: 5,
      title: 'MCAT',
      subtitle: 'Medical College Admission',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      path: 'mcat',
      color: '#7209b7',
      bgColor: 'rgba(114, 9, 183, 0.1)'
    },
    {
      id: 6,
      title: 'MCCQE',
      subtitle: 'Canadian Medical Exam',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      path: 'mccqe',
      color: '#4895ef',
      bgColor: 'rgba(72, 149, 239, 0.1)'
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
              <svg className="title-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Select Your Exam
            </h3>
            <div className="hero-exams-grid">
              {exams.map((exam) => (
                <div 
                  key={exam.id} 
                  className="hero-exam-card"
                  onClick={() => handleExploreExam(exam.path)}
                  style={{ 
                    '--exam-color': exam.color,
                    '--exam-bg-color': exam.bgColor 
                  }}
                >
                  <div className="exam-icon" style={{ backgroundColor: exam.bgColor, color: exam.color }}>
                    {exam.icon}
                  </div>
                  <div className="exam-info">
                    <h3 style={{ color: exam.color }}>{exam.title}</h3>
                    <p>{exam.subtitle}</p>
                  </div>
                  <button 
                    className="exam-explore-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExploreExam(exam.path);
                    }}
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
          {/* Trust Badge */}
          <div className="trust-badge">
            <div className="trust-badge-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="trust-badge-text">Trusted by medical professionals worldwide</p>
          </div>

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
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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