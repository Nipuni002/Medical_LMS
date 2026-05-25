import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUSMLESubjects.css';

const STEP_OPTIONS = [
  { value: 'STEP_1', label: 'Step 1 (CAT MCQ)', defaultColor: '#1e3a8a' },
  { value: 'STEP_2', label: 'Step 2 (Clinical OSCE)', defaultColor: '#1d4ed8' }
];

const WEIGHTAGE_CONFIG = {
  'VERY HIGH WEIGHTAGE': { value: 10, defaultColor: '#1d4ed8' },
  'HIGH WEIGHTAGE': { value: 8, defaultColor: '#f97316' },
  'MODERATE WEIGHTAGE': { value: 5, defaultColor: '#16a34a' },
  'LOW WEIGHTAGE': { value: 4, defaultColor: '#7c3aed' }
};

const WEIGHTAGE_ORDER = [
  'VERY HIGH WEIGHTAGE',
  'HIGH WEIGHTAGE',
  'MODERATE WEIGHTAGE',
  'LOW WEIGHTAGE'
];

const getWeightageColor = (weightage) => {
  const safeWeightage = WEIGHTAGE_CONFIG[weightage] ? weightage : 'MODERATE WEIGHTAGE';
  return WEIGHTAGE_CONFIG[safeWeightage].defaultColor;
};

const normalizeSubject = (subject) => {
  const safeWeightage = WEIGHTAGE_CONFIG[subject.weightage] ? subject.weightage : 'MODERATE WEIGHTAGE';
  const safeWeightageValue = Number.isFinite(Number(subject.weightageValue))
    ? Number(subject.weightageValue)
    : WEIGHTAGE_CONFIG[safeWeightage].value;

  return {
    ...subject,
    weightage: safeWeightage,
    weightageValue: safeWeightageValue,
    order: Number.isFinite(Number(subject.order)) ? Number(subject.order) : 0,
    color: getWeightageColor(safeWeightage)
  };
};

function AdminAMCSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState('STEP_1');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    step: 'STEP_1',
    weightage: 'VERY HIGH WEIGHTAGE',
    weightageValue: WEIGHTAGE_CONFIG['VERY HIGH WEIGHTAGE'].value,
    color: WEIGHTAGE_CONFIG['VERY HIGH WEIGHTAGE'].defaultColor,
    order: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchSubjects();
  }, [navigate]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/amc-subjects');
      const data = await response.json();
      if (Array.isArray(data)) {
        setSubjects(data.map(normalizeSubject));
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching AMC subjects:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const openModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        step: subject.step,
        weightage: subject.weightage || 'MODERATE WEIGHTAGE',
        weightageValue: Number.isFinite(Number(subject.weightageValue))
          ? Number(subject.weightageValue)
          : WEIGHTAGE_CONFIG[subject.weightage || 'MODERATE WEIGHTAGE'].value,
        color: getWeightageColor(subject.weightage),
        order: subject.order || 0
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        step: activeStep,
        weightage: 'VERY HIGH WEIGHTAGE',
        weightageValue: WEIGHTAGE_CONFIG['VERY HIGH WEIGHTAGE'].value,
        color: getWeightageColor('VERY HIGH WEIGHTAGE'),
        order: 0
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'weightage') {
      const selectedWeightage = WEIGHTAGE_CONFIG[value];
      setFormData((prev) => ({
        ...prev,
        weightage: value,
        weightageValue: selectedWeightage.value,
        color: selectedWeightage.defaultColor
      }));
      return;
    }

    if (name === 'step') {
      setFormData((prev) => ({
        ...prev,
        step: value
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter a subject name', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingSubject
        ? `http://localhost:5000/api/amc-subjects/${editingSubject._id}`
        : 'http://localhost:5000/api/amc-subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          step: formData.step,
          weightage: formData.weightage,
          weightageValue: formData.weightageValue,
          color: getWeightageColor(formData.weightage),
          order: formData.order
        })
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.message || 'Failed to save subject', 'error');
        return;
      }

      await fetchSubjects();
      closeModal();
      showToast(editingSubject ? 'Subject updated successfully' : 'Subject created successfully');
    } catch (error) {
      console.error('Error saving subject:', error);
      showToast('Error saving subject', 'error');
    }
  };

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/amc-subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        showToast('Failed to delete subject', 'error');
        return;
      }

      await fetchSubjects();
      showToast('Subject deleted successfully');
    } catch (error) {
      console.error('Error deleting subject:', error);
      showToast('Error deleting subject', 'error');
    }
  };

  const stepCounts = useMemo(() => {
    return STEP_OPTIONS.reduce((acc, step) => {
      acc[step.value] = subjects.filter((subject) => subject.step === step.value).length;
      return acc;
    }, {});
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((subject) => subject.step === activeStep)
      .filter((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (a.weightageValue !== b.weightageValue) {
          return b.weightageValue - a.weightageValue;
        }
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name);
      });
  }, [subjects, activeStep, searchTerm]);

  const groupedSubjects = useMemo(() => {
    const grouped = WEIGHTAGE_ORDER.reduce((acc, weightage) => {
      acc[weightage] = [];
      return acc;
    }, {});

    filteredSubjects.forEach((subject) => {
      const key = WEIGHTAGE_CONFIG[subject.weightage] ? subject.weightage : 'MODERATE WEIGHTAGE';
      grouped[key].push(subject);
    });

    return grouped;
  }, [filteredSubjects]);

  if (loading) {
    return <div className="admin-usmle-loading">Loading AMC subjects...</div>;
  }

  return (
    <div className="admin-usmle-subjects">
      <header className="usmle-admin-header">
        <div>
          <h1>AMC Subjects Management</h1>
          <p>Manage subject lists for AMC Step 1 and Step 2.</p>
        </div>

        <div className="usmle-admin-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/dashboard?section=amc-admin')}>
            Back to AMC Admin
          </button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="step-tabs">
        {STEP_OPTIONS.map((step) => (
          <button
            key={step.value}
            className={`step-tab ${activeStep === step.value ? 'active' : ''}`}
            onClick={() => setActiveStep(step.value)}
          >
            {step.label}
            <span className="step-count">{stepCounts[step.value] || 0}</span>
          </button>
        ))}
      </section>

      <section className="subject-controls">
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="subject-search"
        />
        <button className="btn-primary" onClick={() => openModal()}>
          Add Subject
        </button>
      </section>

      <section className="subject-table-wrap">
        {filteredSubjects.length === 0 ? (
          <p className="empty-state">No subjects found for the selected step.</p>
        ) : (
          WEIGHTAGE_ORDER.map((weightage) => {
            const items = groupedSubjects[weightage] || [];

            if (items.length === 0) {
              return null;
            }

            return (
              <div key={weightage} style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '8px 0 10px' }}>
                  {weightage} ({items.length})
                </h3>
                <table className="subject-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Step</th>
                      <th>Weightage</th>
                      <th>Order</th>
                      <th>Color</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((subject) => (
                      <tr key={subject._id}>
                        <td>{subject.name}</td>
                        <td>{STEP_OPTIONS.find((option) => option.value === subject.step)?.label || subject.step}</td>
                        <td>{subject.weightage}</td>
                        <td>{subject.order}</td>
                        <td>
                          <span className="color-pill" style={{ backgroundColor: subject.color }} />
                          {subject.color}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-edit" onClick={() => openModal(subject)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDelete(subject._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h2>{editingSubject ? 'Edit Subject' : 'Add Subject'}</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Subject Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="step">AMC Step</label>
              <select id="step" name="step" value={formData.step} onChange={handleInputChange}>
                {STEP_OPTIONS.map((step) => (
                  <option key={step.value} value={step.value}>
                    {step.label}
                  </option>
                ))}
              </select>

              <label htmlFor="weightage">Weightage</label>
              <select id="weightage" name="weightage" value={formData.weightage} onChange={handleInputChange}>
                {WEIGHTAGE_ORDER.map((weightage) => (
                  <option key={weightage} value={weightage}>
                    {weightage}
                  </option>
                ))}
              </select>

              <label htmlFor="order">Display Order</label>
              <input
                id="order"
                name="order"
                type="number"
                min="0"
                value={formData.order}
                onChange={handleInputChange}
              />

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default AdminAMCSubjects;
