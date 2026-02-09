import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLABInfo.css';

function PLABInfo() {
  const navigate = useNavigate();

  return (
    <div className="plab-info">
      <Header />
      
      {/* Compact Hero */}
      <div className="plab-info-compact-hero">
        <div className="compact-hero-content">
          <h1>What is PLAB?</h1>
          <p className="compact-hero-subtitle">Professional and Linguistic Assessments Board</p>
        </div>
      </div>

      {/* Main Content - All in one view */}
      <div className="plab-info-compact-container">
        
        {/* Introduction Section */}
        <div className="compact-intro-section">
          <div className="compact-intro-card">
            <div className="compact-intro-icon">🎯</div>
            <p className="compact-intro-text">
              The <strong>PLAB (Professional and Linguistic Assessments Board)</strong> test is the primary pathway for international 
              medical graduates (IMGs) to demonstrate they have the necessary skills and knowledge to practice 
              medicine in the UK.
            </p>
          </div>
          <div className="compact-intro-card">
            <div className="compact-intro-icon">⚖️</div>
            <p className="compact-intro-text">
              It ensures that international doctors are at the same level as UK doctors starting their second year of 
              Foundation Programme training (F2).
            </p>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="compact-section-title">
          <h2>PLAB 1 vs PLAB 2</h2>
        </div>

        <div className="compact-comparison-grid">
          <div className="compact-comparison-col">
            <div className="compact-comparison-header plab1">
              <div className="comparison-badge">PLAB 1</div>
              <h3>Written Examination</h3>
            </div>
            <div className="compact-comparison-details">
              <div className="detail-row">
                <span className="detail-label">Format</span>
                <span className="detail-value">Written MCQ (180 questions)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Focus</span>
                <span className="detail-value">Clinical knowledge and application</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">3 hours</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location</span>
                <span className="detail-value">Global centers</span>
              </div>
            </div>
          </div>

          <div className="compact-comparison-col">
            <div className="compact-comparison-header plab2">
              <div className="comparison-badge">PLAB 2</div>
              <h3>Practical Examination</h3>
            </div>
            <div className="compact-comparison-details">
              <div className="detail-row">
                <span className="detail-label">Format</span>
                <span className="detail-value">OSCE (16 stations)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Focus</span>
                <span className="detail-value">Clinical & communication skills</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">~3 hours</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Location</span>
                <span className="detail-value">Manchester, UK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="compact-section-title">
          <h2>The 4 Main Requirements</h2>
        </div>

        <div className="compact-requirements-grid">
          <div className="compact-requirement">
            <div className="requirement-number">1</div>
            <div className="requirement-content">
              <h4>Medical Degree</h4>
              <p>MBBS recognized by the GMC</p>
            </div>
          </div>

          <div className="compact-requirement">
            <div className="requirement-number">2</div>
            <div className="requirement-content">
              <h4>English Proficiency</h4>
              <p>IELTS 7.5 or OET Grade B</p>
            </div>
          </div>

          <div className="compact-requirement">
            <div className="requirement-number">3</div>
            <div className="requirement-content">
              <h4>GMC Registration</h4>
              <p>Active GMC online account</p>
            </div>
          </div>

          <div className="compact-requirement">
            <div className="requirement-number">4</div>
            <div className="requirement-content">
              <h4>Professional Standing</h4>
              <p>Good standing, no disciplinary issues</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="compact-stats">
          <div className="stat-item">
            <div className="stat-value">4x/year</div>
            <div className="stat-label">PLAB-1 Frequency</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">Year-round</div>
            <div className="stat-label">PLAB-2 Schedule</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">3-6 months</div>
            <div className="stat-label">Prep Time</div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default PLABInfo;