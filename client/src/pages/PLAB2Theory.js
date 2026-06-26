import React, { useMemo, useState, useEffect } from 'react';import API_BASE_URL from '../config/api';import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Theory.css';

function PLAB2Theory() {
  const WEIGHTAGE_ORDER = [
    'VERY HIGH WEIGHTAGE',
    'HIGH WEIGHTAGE',
    'MODERATE WEIGHTAGE',
    'LOW WEIGHTAGE'
  ];

  const WEIGHTAGE_COLOR_MAP = {
    'VERY HIGH WEIGHTAGE': '#1d4ed8',
    'HIGH WEIGHTAGE': '#f97316',
    'MODERATE WEIGHTAGE': '#16a34a',
    'LOW WEIGHTAGE': '#7c3aed'
  };

  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plab-theory-subjects?exam=PLAB_2`);
      const data = await response.json();
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  const groupedSubjects = useMemo(() => {
    const grouped = WEIGHTAGE_ORDER.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});

    filteredSubjects.forEach((subject) => {
      const key = WEIGHTAGE_ORDER.includes(subject.weightage) ? subject.weightage : 'MODERATE WEIGHTAGE';
      grouped[key].push(subject);
    });

    return grouped;
  }, [filteredSubjects]);

  const getWeightageBadgeClass = (weightage) => {
    switch (weightage) {
      case 'VERY HIGH WEIGHTAGE':
        return 'weightage-very-high';
      case 'HIGH WEIGHTAGE':
        return 'weightage-high';
      case 'MODERATE WEIGHTAGE':
        return 'weightage-moderate';
      case 'LOW WEIGHTAGE':
        return 'weightage-low';
      default:
        return 'weightage-other';
    }
  };

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
          <h1 className="main-title">PLAB-2 Theory Bank</h1>
          <p className="subtitle">Master the essential OSCE topics</p>

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

          {searchTerm && Object.values(groupedSubjects).every((arr) => arr.length === 0) ? (
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
            WEIGHTAGE_ORDER.map((weightage) => {
              const subjectsInCategory = groupedSubjects[weightage];
              if (subjectsInCategory.length === 0) return null;

              return (
                <div key={weightage} className="weightage-section">
                  <div className="section-header">
                    <span className={`weightage-badge ${getWeightageBadgeClass(weightage)}`}>{weightage}</span>
                    <span className="subject-count">{subjectsInCategory.length} topics</span>
                  </div>

                  <div className="subject-tabs" role="group" aria-label={`${weightage} PLAB subjects`}>
                    {subjectsInCategory.map((subject) => (
                      <button
                        key={subject._id}
                        className="subject-tab-btn"
                        style={{
                          '--subject-color': subject.color || WEIGHTAGE_COLOR_MAP[subject.weightage] || WEIGHTAGE_COLOR_MAP['MODERATE WEIGHTAGE']
                        }}
                        onClick={() => {
                          navigate(`/plab/plab2/theory/${subject._id}`);
                        }}
                      >
                        <span className="subject-name">{subject.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PLAB2Theory;
