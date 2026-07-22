import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import './AdminTheoryContent.css';

function AdminTheoryContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const examType = new URLSearchParams(location.search).get('exam') === 'PLAB_2' ? 'PLAB_2' : 'PLAB_1';
  const examLabel = examType === 'PLAB_2' ? 'PLAB-2' : 'PLAB-1';
  const [subjects, setSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchSubjects();
  }, [examType]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plab-theory-subjects?exam=${examType}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        showNotification(errData?.message || 'Error fetching subjects', 'error');
        setSubjects([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      } else {
        setSubjects([]);
        showNotification(data?.message || 'Error fetching subjects', 'error');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      setLoading(false);
      showNotification('Error fetching subjects', 'error');
    }
  };

  const selectSubject = (subjectId) => {
    if (!subjectId) return;
    navigate(`/admin/theory-content/${subjectId}?exam=${examType}`);
  };

  const groupSubjectsByWeightage = useMemo(() => {
    const grouped = {
      'VERY HIGH WEIGHTAGE': [],
      'HIGH WEIGHTAGE': [],
      'MODERATE WEIGHTAGE': [],
      'LOW WEIGHTAGE': []
    };

    const filteredSubjects = subjects.filter(subject =>
      subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase())
    );

    filteredSubjects.forEach(subject => {
      if (grouped[subject.weightage]) {
        grouped[subject.weightage].push(subject);
      }
    });

    return grouped;
  }, [subjects, subjectSearchTerm]);

  const getWeightageConfig = (weightage) => {
    switch (weightage) {
      case 'VERY HIGH WEIGHTAGE':
        return {
          bgColor: '#1e40af',
          borderColor: '#1d4ed8',
          icon: '🔥',
          badgeColor: '#dc2626',
          label: 'VERY HIGH WEIGHTAGE (PASS-DECIDING)'
        };
      case 'HIGH WEIGHTAGE':
        return {
          bgColor: '#7c3aed',
          borderColor: '#8b5cf6',
          icon: '⚡',
          badgeColor: '#ea580c',
          label: 'HIGH WEIGHTAGE'
        };
      case 'MODERATE WEIGHTAGE':
        return {
          bgColor: '#0891b2',
          borderColor: '#06b6d4',
          icon: '⚖️',
          badgeColor: '#16a34a',
          label: 'MODERATE WEIGHTAGE'
        };
      case 'LOW WEIGHTAGE':
        return {
          bgColor: '#059669',
          borderColor: '#10b981',
          icon: '📘',
          badgeColor: '#2563eb',
          label: 'LOW WEIGHTAGE'
        };
      default:
        return {
          bgColor: '#64748b',
          borderColor: '#94a3b8',
          icon: '📝',
          badgeColor: '#6b7280',
          label: 'OTHER'
        };
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-theory-content">
      <div className="admin-header">
        <h1>Manage {examLabel} Theory Subject Content</h1>
        <button onClick={() => navigate('/admin/dashboard?section=plab-admin')} className="back-button">
          ← Back to PLAB Admin Section
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="content-form-container">
        <div className="subject-selector">
          <div className="admin-subject-bank-header">
            <h2>Select {examLabel} Subject by Weightage</h2>
            <p>Choose a subject card below to manage theory content.</p>
            <div className="selected-subject-chip">
              Click a subject card to open content editor page
            </div>
          </div>

          <div className="admin-subject-search-container">
            <div className="admin-subject-search-box">
              <span className="admin-subject-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search subjects..."
                value={subjectSearchTerm}
                onChange={(e) => setSubjectSearchTerm(e.target.value)}
                className="admin-subject-search-input"
              />
              {subjectSearchTerm && (
                <button
                  className="admin-clear-search"
                  onClick={() => setSubjectSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {subjectSearchTerm && Object.values(groupSubjectsByWeightage).every(arr => arr.length === 0) ? (
            <div className="admin-no-subjects-found">
              <h3>No subjects found</h3>
              <p>No subjects match your search for "{subjectSearchTerm}"</p>
            </div>
          ) : (
            Object.keys(groupSubjectsByWeightage).map((weightage) => {
              const subjectsInCategory = groupSubjectsByWeightage[weightage];
              if (subjectsInCategory.length === 0) return null;

              const config = getWeightageConfig(weightage);

              return (
                <div key={weightage} className="admin-weightage-section">
                  <div className="admin-weightage-header">
                    <span className="admin-weightage-badge" style={{ backgroundColor: config.badgeColor }}>
                      {config.icon} {config.label}
                    </span>
                    <span className="admin-subject-count">{subjectsInCategory.length} subjects</span>
                  </div>

                  <div className="admin-subject-grid">
                    {subjectsInCategory.map((subject) => (
                      <button
                        key={subject._id}
                        className="admin-subject-item"
                        style={{
                          backgroundColor: config.bgColor,
                          borderLeft: `4px solid ${config.borderColor}`
                        }}
                        onClick={() => selectSubject(subject._id)}
                      >
                        <span className="admin-subject-name">{subject.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminTheoryContent;
