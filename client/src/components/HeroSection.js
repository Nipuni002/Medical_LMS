import React, { useState, useEffect } from 'react';
import './HeroSection.css';

function HeroSection() {
  const images = [
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=2000&q=80', // Medical students studying
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=2000&q=80', // Healthcare education
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80', // Medical lecture
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="hero-section" id="home">
      <div className="hero-background">
        <div 
          className="hero-image-slide active"
          style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
        />
        <div className="hero-overlay"></div>
        
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

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>Trusted by Medical Students Worldwide</span>
          </div>
          
          <h2 className="hero-subtitle">Your Medical Education Partner</h2>
          <h1 className="hero-title">
            Master Your Medical & Licensing Exams with <span className="highlight">Confidence</span>
          </h1>
          
          <p className="hero-description">
            Comprehensive study resources, expert-led courses, and proven strategies 
            to help you excel in USMLE, MCAT, NCLEX, and other medical examinations.
          </p>
          
          <div className="hero-cta">
            <button className="cta-primary">
              <span>Start Free Trial</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="cta-secondary">
              <span>View Courses</span>
            </button>
          </div>

          <div className="hero-features">
            <div className="feature">
              <div className="feature-icon">📚</div>
              <span>Comprehensive Study Materials</span>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <span>Exam-Focused Content</span>
            </div>
            <div className="feature">
              <div className="feature-icon">👨‍⚕️</div>
              <span>Expert Medical Tutors</span>
            </div>
          </div>
        </div>

      
      </div>
    </section>
  );
}

export default HeroSection;