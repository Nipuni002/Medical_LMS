import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import './AdminTheoryContent.css';

const STEP_ORDER = ['STEP_1', 'STEP_2'];

const getStepConfig = (step) => {
  switch (step) {
    case 'STEP_1':
      return {
        bgColor: '#1e40af',
        borderColor: '#1d4ed8',
        icon: '📘',
        badgeColor: '#2563eb',
        label: 'STEP 1 (Theory)'
      };
    case 'STEP_2':
      return {
        bgColor: '#2563eb',
        borderColor: '#3b82f6',
        icon: '🩺',
        badgeColor: '#0284c7',
        label: 'STEP 2 (Clinical)'
      };
    default:
      return {
        bgColor: '#64748b',
        borderColor: '#94a3b8',
        icon: '📘',
        badgeColor: '#6b7280',
        label: step || 'OTHER'
      };
  }
};

function AdminNEXTContent() {
  const navigate = useNavigate();
  const { step } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const normalizedStep = STEP_ORDER.includes(step) ? step : null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSubjects();
  }, [navigate]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/next-subjects`);
      const data = await response.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Error fetching subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const groupedSubjects = useMemo(() => {
    const grouped = {
      STEP_1: [],
      STEP_2: []
    };

    const filteredSubjects = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase())
    );

    filteredSubjects.forEach((subject) => {
      if (grouped[subject.step]) {
        grouped[subject.step].push(subject);
      }
    });

    STEP_ORDER.forEach((stepItem) => {
      grouped[stepItem].sort((a, b) => {
        if ((a.order || 0) !== (b.order || 0)) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.name.localeCompare(b.name);
      });
    });

    return grouped;
  }, [subjects, subjectSearchTerm]);

  const stepSubjects = useMemo(() => {
    if (!normalizedStep) return [];
    return groupedSubjects[normalizedStep] || [];
  }, [groupedSubjects, normalizedStep]);

  const openSubjectContentEditor = (subjectId) => {
    if (!subjectId) return;
    navigate(`/admin/next-content/${subjectId}`);
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!normalizedStep) {
    return (
      <div className="admin-theory-content">
        <div className="admin-header">
          <h1>Manage NExT Subject Content</h1>
          <button onClick={() => navigate('/admin/dashboard?section=next-admin')} className="back-button">
            ← Back to NExT Admin Section
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
              <h2>Select NExT Step</h2>
              <p>Open a separate page for NExT Step 1 and Step 2 subjects.</p>
            </div>

            <div className="admin-subject-grid">
              {STEP_ORDER.map((stepItem) => {
                const config = getStepConfig(stepItem);
                const count = groupedSubjects[stepItem]?.length || 0;

                return (
                  <button
                    key={stepItem}
                    className="admin-subject-item"
                    style={{
                      backgroundColor: config.bgColor,
                      borderLeft: `4px solid ${config.borderColor}`
                    }}
                    onClick={() => navigate(`/admin/next-content/step/${stepItem}`)}
                  >
                    <span className="admin-subject-name">{config.icon} {config.label} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedStepConfig = getStepConfig(normalizedStep);

  return (
    <div className="admin-theory-content">
      <div className="admin-header">
        <h1>Manage NExT Subject Content</h1>
        <button onClick={() => navigate('/admin/next-content')} className="back-button">
          ← Back to Step Selection
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
            <h2>{selectedStepConfig.icon} {selectedStepConfig.label} Subjects</h2>
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

          {subjectSearchTerm && stepSubjects.length === 0 ? (
            <div className="admin-no-subjects-found">
              <h3>No subjects found</h3>
              <p>No subjects match your search for "{subjectSearchTerm}"</p>
            </div>
          ) : (
            <div className="admin-weightage-section">
              <div className="admin-weightage-header">
                <span className="admin-weightage-badge" style={{ backgroundColor: selectedStepConfig.badgeColor }}>
                  {selectedStepConfig.icon} {selectedStepConfig.label}
                </span>
                <span className="admin-subject-count">{stepSubjects.length} subjects</span>
              </div>

              {stepSubjects.length === 0 ? (
                <div className="admin-no-subjects-found">
                  <h3>No subjects yet</h3>
                  <p>Add subjects first from NExT Subject Management for this step.</p>
                </div>
              ) : (
                <div className="admin-subject-grid">
                  {stepSubjects.map((subject) => (
                    <button
                      key={subject._id}
                      className="admin-subject-item"
                      style={{
                        backgroundColor: selectedStepConfig.bgColor,
                        borderLeft: `4px solid ${selectedStepConfig.borderColor}`
                      }}
                      onClick={() => openSubjectContentEditor(subject._id)}
                    >
                      <span className="admin-subject-name">{subject.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNEXTContent;
