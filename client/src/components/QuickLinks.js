import React, { useState } from 'react';
import './QuickLinks.css';

function QuickLinks() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const quickLinks = [
    {
      id: 'exams',
      title: 'Exam Resources',
      icon: '📚',
      description: 'Comprehensive materials for USMLE, MCAT, NCLEX, and more',
      color: '#001f5c',
      features: [
        'Practice Questions Bank',
        'Mock Exams & Simulations',
        'Score Predictor Tool',
        'Personalized Study Plans'
      ],
      ctaText: 'Explore Exams',
      link: '#exams'
    },
    {
      id: 'subjects',
      title: 'Subject Library',
      icon: '🧬',
      description: 'In-depth coverage of all medical disciplines',
      color: '#0066cc',
      features: [
        'Anatomy & Physiology',
        'Pharmacology & Pathology',
        'Biochemistry & Genetics',
        'Clinical Medicine'
      ],
      ctaText: 'Browse Subjects',
      link: '#subjects'
    },
  ];

  return (
    <section className="quick-links" id="quick-links">
      <div className="quick-links-container">
        <div className="section-header">
          <h2 className="section-title">Accelerate Your Medical Learning</h2>
          <p className="section-subtitle">
            Access everything you need for exam success in one place
          </p>
        </div>

        <div className="links-grid">
          {quickLinks.map((link, index) => (
            <div
              key={link.id}
              className={`link-card ${hoveredCard === link.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(link.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => window.location.hash = link.link}
            >
              {/* Animated background elements */}
              <div 
                className="card-background"
                style={{ backgroundColor: link.color }}
              />
              
              {/* Floating particles */}
              <div className="particles">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i}
                    className="particle"
                    style={{
                      '--delay': `${i * 0.1}s`,
                      '--x': `${Math.random() * 100}%`,
                      '--y': `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              <div className="card-content">
                <div className="card-header">
                  <div className="icon-container">
                    <span className="link-icon">{link.icon}</span>
                    <div className="icon-ring"></div>
                    <div className="icon-glow"></div>
                  </div>
                  
                  <h3 className="card-title">
                    {link.title}
                    <div className="title-underline"></div>
                  </h3>
                </div>

                <p className="card-description">{link.description}</p>

                <div className="card-features">
                  <div className="features-title">Includes:</div>
                  <ul className="features-list">
                    {link.features.map((feature, idx) => (
                      <li key={idx} className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-footer">
                  <button className="card-cta">
                    <span>{link.ctaText}</span>
                    <svg 
                      className="cta-arrow" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path 
                        d="M5 12H19M19 12L12 5M19 12L12 19" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  
                  <div className="hover-indicator">
                    <span>Click to explore</span>
                    <div className="arrow-pulse">
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card shine effect */}
              <div className="card-shine"></div>
            </div>
          ))}
        </div>

      
      </div>
    </section>
  );
}

export default QuickLinks;