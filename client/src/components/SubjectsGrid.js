import React, { useState } from 'react';
import './SubjectsGrid.css';

function SubjectsGrid() {
  const [activeSubject, setActiveSubject] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const subjects = [
    { 
      id: 1, 
      name: 'Anatomy', 
      icon: '🧠',
      color: '#4f46e5',
      description: 'Study of body structures and systems',
      topics: ['Musculoskeletal', 'Neuroanatomy', 'Cardiovascular']
    },
    { 
      id: 2, 
      name: 'Physiology', 
      icon: '💓',
      color: '#0d9488',
      description: 'Understanding body functions and processes',
      topics: ['Cardiac', 'Respiratory', 'Renal']
    },
    { 
      id: 3, 
      name: 'Biochemistry', 
      icon: '🧬',
      color: '#059669',
      description: 'Chemical processes in living organisms',
      topics: ['Metabolism', 'Enzymes', 'Molecular Biology']
    },
    { 
      id: 4, 
      name: 'Pharmacology', 
      icon: '💊',
      color: '#dc2626',
      description: 'Drug actions and interactions',
      topics: ['Drug Classes', 'Mechanisms', 'Therapeutics']
    },
    { 
      id: 5, 
      name: 'Pathology', 
      icon: '🔬',
      color: '#7c3aed',
      description: 'Study of diseases and their effects',
      topics: ['Histopathology', 'Clinical', 'Molecular']
    },
    { 
      id: 6, 
      name: 'Microbiology', 
      icon: '🦠',
      color: '#ea580c',
      description: 'Microorganisms and their impact',
      topics: ['Bacteriology', 'Virology', 'Immunology']
    },
    { 
      id: 7, 
      name: 'Genetics', 
      icon: '🧬',
      color: '#0ea5e9',
      description: 'Heredity and genetic variation',
      topics: ['Molecular', 'Clinical', 'Population']
    },
    { 
      id: 8, 
      name: 'Embryology', 
      icon: '👶',
      color: '#db2777',
      description: 'Development from fertilization to birth',
      topics: ['Organogenesis', 'Teratology', 'Fetal Development']
    }
  ];

  const handleSubjectClick = (subject) => {
    setActiveSubject(activeSubject?.id === subject.id ? null : subject);
  };

  return (
    <section className="subjects-grid" id="subjects">
      <div className="subjects-container">
        <div className="section-intro">
          <h2 className="section-title">Explore Medical Subjects</h2>
          <p className="section-description">
            Dive into comprehensive medical disciplines with interactive learning modules
          </p>
        </div>

        <div className="subjects-wrapper">
          <div className="subjects-display">
            <div className="grid-container">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`subject-card ${activeSubject?.id === subject.id ? 'active' : ''}`}
                  style={{ '--subject-color': subject.color }}
                  onMouseEnter={() => setHoveredId(subject.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSubjectClick(subject)}
                >
                  <div className="card-front">
                    {/* Background pattern */}
                    <div className="card-pattern">
                      <div className="pattern-dot"></div>
                      <div className="pattern-dot"></div>
                      <div className="pattern-dot"></div>
                      <div className="pattern-dot"></div>
                    </div>
                    
                    {/* Subject icon */}
                    <div className="subject-icon">
                      <span className="icon-emoji">{subject.icon}</span>
                      <div className="icon-ring"></div>
                      <div className="icon-glow"></div>
                    </div>
                    
                    {/* Subject name */}
                    <h3 className="subject-name">{subject.name}</h3>
                    
                    {/* Hover indicator */}
                    <div className="hover-indicator">
                      <span>Click to explore</span>
                      <div className="indicator-arrow">→</div>
                    </div>
                    
                    {/* Floating elements */}
                    {hoveredId === subject.id && (
                      <div className="floating-elements">
                        <div className="floating-dot" style={{ animationDelay: '0s' }}></div>
                        <div className="floating-dot" style={{ animationDelay: '0.2s' }}></div>
                        <div className="floating-dot" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Back side (expanded) */}
                  <div className="card-back">
                    <div className="back-content">
                      <button 
                        className="close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSubject(null);
                        }}
                      >
                        ×
                      </button>
                      
                      <div className="expanded-icon">
                        {subject.icon}
                      </div>
                      
                      <h3 className="expanded-title">{subject.name}</h3>
                      <p className="expanded-description">{subject.description}</p>
                      
                      <div className="topics-section">
                        <h4>Key Topics</h4>
                        <div className="topics-list">
                          {subject.topics.map((topic, index) => (
                            <span key={index} className="topic-tag">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <button className="explore-btn">
                        Explore {subject.name}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Info Panel */}
          {activeSubject ? (
            <div className="subject-info-panel">
              <div className="panel-header">
                <div className="panel-icon">{activeSubject.icon}</div>
                <h3>Studying {activeSubject.name}</h3>
              </div>
              
              <div className="panel-content">
                <div className="study-tips">
                  <h4>Study Tips</h4>
                  <ul>
                    <li>Use visual aids and diagrams</li>
                    <li>Practice with clinical scenarios</li>
                    <li>Focus on key concepts first</li>
                    <li>Review regularly spaced intervals</li>
                  </ul>
                </div>
                
                <div className="resources">
                  <h4>Recommended Resources</h4>
                  <div className="resource-tags">
                    <span className="resource-tag">Video Lectures</span>
                    <span className="resource-tag">Flashcards</span>
                    <span className="resource-tag">Q-Bank</span>
                    <span className="resource-tag">Case Studies</span>
                  </div>
                </div>
                
                <button className="start-learning-btn">
                  Start Learning {activeSubject.name}
                </button>
              </div>
            </div>
          ) : (
            <div className="subject-info-panel placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">👆</div>
                <h3>Select a Subject</h3>
                <p>Click on any subject card to view detailed information, study tips, and resources</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Dots */}
        <div className="nav-dots">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className={`nav-dot ${activeSubject?.id === subject.id ? 'active' : ''}`}
              onClick={() => handleSubjectClick(subject)}
              style={{ backgroundColor: subject.color }}
              aria-label={`Select ${subject.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubjectsGrid;