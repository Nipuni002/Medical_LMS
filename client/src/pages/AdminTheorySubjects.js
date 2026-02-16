import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTheorySubjects.css';

function AdminTheorySubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    weightage: 'VERY HIGH WEIGHTAGE',
    weightageValue: 10,
    color: '#1e3a8a'
  });

  const weightageConfig = {
    'VERY HIGH WEIGHTAGE': {
      value: 10,
      colors: ['#1e3a8a', '#1e40af', '#1d4ed8'],
      defaultColor: '#1e3a8a',
      badgeColor: '#dc2626',
      icon: '🔥',
      description: 'Critical pass-deciding topics'
    },
    'HIGH WEIGHTAGE': {
      value: 8,
      colors: ['#2563eb', '#3b82f6', '#60a5fa'],
      defaultColor: '#2563eb',
      badgeColor: '#f97316',
      icon: '⚡',
      description: 'High importance topics'
    },
    'MODERATE WEIGHTAGE': {
      value: 5,
      colors: ['#0ea5e9', '#38bdf8', '#7dd3fc'],
      defaultColor: '#0ea5e9',
      badgeColor: '#22c55e',
      icon: '⚖️',
      description: 'Moderately important topics'
    },
    'LOW WEIGHTAGE': {
      value: 4,
      colors: ['#38bdf8', '#7dd3fc', '#bae6fd'],
      defaultColor: '#38bdf8',
      badgeColor: '#3b82f6',
      icon: '📘',
      description: 'Supportive topics'
    }
  };

  useEffect(() => {
    checkAuth();
    fetchSubjects();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plab-theory-subjects');
      const data = await response.json();
      // Sort by name
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setSubjects(sortedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'weightage') {
      const config = weightageConfig[value];
      setFormData(prev => ({
        ...prev,
        weightage: value,
        weightageValue: config.value,
        color: config.defaultColor
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showNotification('Please enter a subject name', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingSubject
        ? `http://localhost:5000/api/plab-theory-subjects/${editingSubject._id}`
        : 'http://localhost:5000/api/plab-theory-subjects';
      
      const method = editingSubject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchSubjects();
        closeModal();
        showNotification(
          editingSubject ? '✅ Subject updated successfully!' : '✅ Subject added successfully!',
          'success'
        );
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to save subject', 'error');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      showNotification('Error saving subject', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/plab-theory-subjects/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSubjects();
        showNotification('🗑️ Subject deleted successfully!', 'success');
      } else {
        showNotification('Failed to delete subject', 'error');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      showNotification('Error deleting subject', 'error');
    }
    setShowConfirmDialog(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setDeleteId(null);
  };

  const openModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        weightage: subject.weightage,
        weightageValue: subject.weightageValue,
        color: subject.color
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        weightage: 'VERY HIGH WEIGHTAGE',
        weightageValue: weightageConfig['VERY HIGH WEIGHTAGE'].value,
        color: weightageConfig['VERY HIGH WEIGHTAGE'].defaultColor
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
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

  const groupedSubjects = groupSubjectsByWeightage();
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-theory-subjects">
      {/* Header Section */}
      <div className="admin-header">
        <div className="header-main">
          <div className="header-info">
            <h1>PLAB-1 Theory Subjects Management</h1>
            <p className="header-subtitle">Manage and organize subjects by weightage categories</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{subjects.length}</span>
              <span className="stat-label">Total Subjects</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">
            <span className="btn-icon">←</span> Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            <span className="btn-icon">🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* Search and Action Bar */}
        <div className="action-bar">
          <div className="search-section">
            <div className="admin-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search subjects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <span className="search-result-count">
                Found {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button onClick={() => openModal()} className="btn-primary">
            <span className="btn-icon">+</span> Add New Subject
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading subjects...</p>
          </div>
        ) : (
          <div className="subjects-dashboard">
            {/* Subjects Table Section */}
            <div className="subjects-table-container">
              <div className="table-header">
                <h3>All Subjects Overview</h3>
                <span className="table-count">
                  {searchTerm 
                    ? `${filteredSubjects.length} of ${subjects.length} subjects` 
                    : `${subjects.length} subjects total`
                  }
                </span>
              </div>
              
              <div className="table-responsive">
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th className="col-name">Subject Name</th>
                      <th className="col-weightage">Weightage</th>
                      <th className="col-color">Color</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="no-results">
                          <div className="no-results-message">
                            <span className="no-results-icon">🔍</span>
                            <p>No subjects found matching "{searchTerm}"</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((subject) => {
                      const config = weightageConfig[subject.weightage];
                      return (
                        <tr key={subject._id} className="subject-row">
                          <td className="subject-name-cell">
                            <div className="subject-name-content">
                              <span 
                                className="color-indicator" 
                                style={{ backgroundColor: subject.color }}
                              ></span>
                              <span className="subject-name">{subject.name}</span>
                            </div>
                          </td>
                          <td className="weightage-cell">
                            <span className="weightage-badge" style={{ backgroundColor: config.badgeColor }}>
                              {config.icon} {subject.weightage.replace(' WEIGHTAGE', '')}
                            </span>
                          </td>
                          <td className="color-cell">
                            <div className="color-display">
                              <div 
                                className="color-box" 
                                style={{ backgroundColor: subject.color }}
                              ></div>
                              <span className="color-code">{subject.color}</span>
                            </div>
                          </td>
                          <td className="actions-cell">
                            <div className="action-buttons">
                              <button
                                onClick={() => openModal(subject)}
                                className="btn-action btn-edit"
                                title="Edit Subject"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(subject._id)}
                                className="btn-action btn-delete"
                                title="Delete Subject"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weightage Summary Sidebar */}
            <div className="weightage-sidebar">
              <div className="sidebar-header">
                <h3>Weightage Summary</h3>
                <span className="sidebar-subtitle">Distribution by categories</span>
              </div>
              
              <div className="weightage-cards">
                {Object.keys(groupedSubjects).map((weightage) => {
                  const subjectsInCategory = groupedSubjects[weightage];
                  const config = weightageConfig[weightage];
                  const percentage = subjects.length > 0 
                    ? Math.round((subjectsInCategory.length / subjects.length) * 100) 
                    : 0;

                  return (
                    <div key={weightage} className="weightage-card">
                      <div className="card-header" style={{ backgroundColor: config.defaultColor }}>
                        <div className="header-content">
                          <span className="weightage-icon">{config.icon}</span>
                          <div>
                            <h4 className="card-title">{weightage.replace(' WEIGHTAGE', '')}</h4>
                            <p className="card-subtitle">{config.description}</p>
                          </div>
                        </div>
                        <span className="card-badge">{subjectsInCategory.length}</span>
                      </div>
                      <div className="card-body">
                        <div className="stats-row">
                          <div className="stat">
                            <span className="stat-value">{subjectsInCategory.length}</span>
                            <span className="stat-label">subjects</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">{percentage}%</span>
                            <span className="stat-label">of total</span>
                          </div>
                          <div className="stat">
                            <span className="stat-value">{config.value}</span>
                            <span className="stat-label">marks value</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <h4>Quick Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-number">{subjects.length}</span>
                    <span className="stat-name">Total Subjects</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number">
                      {new Set(subjects.map(s => s.weightage)).size}
                    </span>
                    <span className="stat-name">Categories</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-section">
                <h4>Subject Details</h4>
                
                <div className="form-group">
                  <label>
                    <span className="label-icon">📚</span>
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter subject name (e.g., Cardiology)"
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <span className="label-icon">🏷️</span>
                      Weightage Category *
                    </label>
                    <select
                      name="weightage"
                      value={formData.weightage}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    >
                      <option value="VERY HIGH WEIGHTAGE">🔥 Very High Weightage</option>
                      <option value="HIGH WEIGHTAGE">⚡ High Weightage</option>
                      <option value="MODERATE WEIGHTAGE">⚖️ Moderate Weightage</option>
                      <option value="LOW WEIGHTAGE">📘 Low Weightage</option>
                    </select>
                    <div className="form-hint">
                      Marks value: {formData.weightageValue}
                    </div>
                  </div>

                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">🎨</span>
                    Display Color
                  </label>
                  <div className="color-section">
                    <div className="color-preview-row">
                      <div 
                        className="color-preview-box" 
                        style={{ backgroundColor: formData.color }}
                      ></div>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="color-input"
                        placeholder="#1e3a8a"
                      />
                    </div>
                    
                    <div className="color-suggestions">
                      <span className="suggestions-label">Suggested colors for this weightage:</span>
                      <div className="color-chips">
                        {weightageConfig[formData.weightage].colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="color-chip"
                            style={{ backgroundColor: color }}
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            title={color}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="color-picker"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingSubject ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3 className="confirm-title">Delete Subject?</h3>
            <p className="confirm-message">
              Are you sure you want to delete this subject? This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button onClick={handleCancelDelete} className="btn-confirm-cancel">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTheorySubjects;