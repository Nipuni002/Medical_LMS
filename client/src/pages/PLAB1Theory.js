import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Theory.css';

function PLAB1Theory() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plab-theory-subjects');
      const data = await response.json();
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const groupSubjectsByWeightage = () => {
    const grouped = {
      'VERY HIGH WEIGHTAGE': [],
      'HIGH WEIGHTAGE': [],
      'MODERATE WEIGHTAGE': [],
      'LOW WEIGHTAGE': []
    };

    // Filter subjects based on search term
    const filteredSubjects = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredSubjects.forEach(subject => {
      if (grouped[subject.weightage]) {
        grouped[subject.weightage].push(subject);
      }
    });

    return grouped;
  };

  const getWeightageConfig = (weightage) => {
    switch (weightage) {
      case 'VERY HIGH WEIGHTAGE':
        return {
          bgColor: '#1e40af',
          borderColor: '#1d4ed8',
          textColor: '#ffffff',
          icon: '🔥',
          badgeColor: '#dc2626',
          label: 'VERY HIGH WEIGHTAGE (PASS-DECIDING)',
          value: 10
        };
      case 'HIGH WEIGHTAGE':
        return {
          bgColor: '#7c3aed',
          borderColor: '#8b5cf6',
          textColor: '#ffffff',
          icon: '⚡',
          badgeColor: '#ea580c',
          label: 'HIGH WEIGHTAGE',
          value: 8
        };
      case 'MODERATE WEIGHTAGE':
        return {
          bgColor: '#0891b2',
          borderColor: '#06b6d4',
          textColor: '#ffffff',
          icon: '⚖️',
          badgeColor: '#16a34a',
          label: 'MODERATE WEIGHTAGE',
          value: 5
        };
      case 'LOW WEIGHTAGE':
        return {
          bgColor: '#059669',
          borderColor: '#10b981',
          textColor: '#ffffff',
          icon: '📘',
          badgeColor: '#2563eb',
          label: 'LOW WEIGHTAGE',
          value: 4
        };
      default:
        return {
          bgColor: '#64748b',
          borderColor: '#94a3b8',
          textColor: '#ffffff',
          icon: '📝',
          badgeColor: '#6b7280',
          label: 'OTHER',
          value: 0
        };
    }
  };

  const groupedSubjects = groupSubjectsByWeightage();

  if (loading) {
    return (
      <div className="plab1-theory">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading subjects...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="plab1-theory">
      <Header />
      
      <div className="theory-content">
        <div className="theory-header">
          <h1 className="main-title">PLAB-1 Theory Bank</h1>
          <p className="subtitle">Master the essential topics</p>
          
          <div className="header-info">
            <div className="info-card">
              <span className="info-icon">📚</span>
              <span className="info-text">Total: {subjects.length} subjects</span>
            </div>
            <div className="info-card">
              <span className="info-icon">🎯</span>
              <span className="info-text">Focus on Top 10</span>
            </div>
          </div>
        </div>

        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="compact-container">
          <div className="exam-note">
            <div className="note-icon">💡</div>
            <div className="note-content">
              <strong>Key Strategy:</strong> Master Very High Weightage topics first - they are pass-deciding.
            </div>
          </div>

          {searchTerm && Object.values(groupedSubjects).every(arr => arr.length === 0) ? (
            <div className="no-subjects-found">
              <span className="no-subjects-icon">🔍</span>
              <h3>No subjects found</h3>
              <p>No subjects match your search for "{searchTerm}"</p>
              <button 
                className="clear-search-btn-large"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            Object.keys(groupedSubjects).map((weightage) => {
              const subjectsInCategory = groupedSubjects[weightage];
              if (subjectsInCategory.length === 0) return null;

            const config = getWeightageConfig(weightage);

            return (
              <div key={weightage} className="weightage-section">
                <div className="section-header">
                  <span className="weightage-badge" style={{ backgroundColor: config.badgeColor }}>
                    {config.icon} {config.label} ({config.value})
                  </span>
                  <span className="subject-count">{subjectsInCategory.length} topics</span>
                </div>
                
                <div className="compact-grid">
                  {subjectsInCategory.map((subject) => (
                    <button
                      key={subject._id}
                      className="subject-item"
                      style={{
                        backgroundColor: config.bgColor,
                        borderLeft: `4px solid ${config.borderColor}`
                      }}
                      onClick={() => {
                        navigate(`/theory/${subject._id}`);
                      }}
                    >
                      <span className="subject-name">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PLAB1Theory;