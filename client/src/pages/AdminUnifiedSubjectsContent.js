import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import './AdminUnifiedSubjectsContent.css';

const CATEGORY_CONFIG = {
  plab: {
    id: 'plab',
    label: 'PLAB',
    subjectsApi: `${API_BASE_URL}/api/plab-theory-subjects`,
    contentApi: `${API_BASE_URL}/api/plab-theory-content`,
    adminLabel: 'PLAB Admin',
    contentPath: (subjectId, step) => `/admin/theory-content/${subjectId}?exam=${step || 'PLAB_1'}`,
    supportsSteps: true,
    stepField: 'examType',
    stepQueryParam: 'exam',
    fetchAllStepsIndividually: true,
    defaultColor: '#1e3a8a',
    steps: [
      { value: 'PLAB_1', label: 'PLAB-1' },
      { value: 'PLAB_2', label: 'PLAB-2' }
    ]
  },
  usmle: {
    id: 'usmle',
    label: 'USMLE',
    subjectsApi: `${API_BASE_URL}/api/usmle-subjects`,
    contentApi: `${API_BASE_URL}/api/usmle-theory-content`,
    adminLabel: 'USMLE Admin',
    contentPath: (subjectId) => `/admin/usmle-content/${subjectId}`,
    supportsSteps: true,
    stepField: 'step',
    stepQueryParam: 'step',
    fetchAllStepsIndividually: false,
    defaultColor: '#1e3a8a',
    steps: [
      { value: 'STEP_1', label: 'Step 1' },
      { value: 'STEP_2', label: 'Step 2 CK' },
      { value: 'STEP_3', label: 'Step 3' }
    ]
  },
  amc: {
    id: 'amc',
    label: 'AMC',
    subjectsApi: `${API_BASE_URL}/api/amc-subjects`,
    contentApi: `${API_BASE_URL}/api/amc-theory-content`,
    adminLabel: 'AMC Admin',
    contentPath: (subjectId) => `/admin/amc-content/${subjectId}`,
    supportsSteps: true,
    stepField: 'step',
    stepQueryParam: 'step',
    fetchAllStepsIndividually: false,
    defaultColor: '#1e3a8a',
    steps: [
      { value: 'STEP_1', label: 'Step 1 (CAT MCQ)' },
      { value: 'STEP_2', label: 'Step 2 (Clinical OSCE)' }
    ]
  }
};

const WEIGHTAGE_OPTIONS = [
  { value: 'VERY HIGH WEIGHTAGE', label: 'Very High Weightage', weightageValue: 10, defaultColor: '#1d4ed8' },
  { value: 'HIGH WEIGHTAGE', label: 'High Weightage', weightageValue: 8, defaultColor: '#f97316' },
  { value: 'MODERATE WEIGHTAGE', label: 'Moderate Weightage', weightageValue: 5, defaultColor: '#16a34a' },
  { value: 'LOW WEIGHTAGE', label: 'Low Weightage', weightageValue: 4, defaultColor: '#7c3aed' }
];

const getWeightageOption = (weightage) => {
  return WEIGHTAGE_OPTIONS.find((option) => option.value === weightage) || WEIGHTAGE_OPTIONS[2];
};

const DEFAULT_IMPORT_FORM = {
  sourceCategory: 'usmle',
  sourceSubjectId: '',
  targetStep: 'STEP_1',
  includeContent: true,
  overwriteContent: false
};

const normalizeName = (value = '') => value.trim().toLowerCase();

const normalizeSubject = (subject, config) => {
  const resolvedWeightage = getWeightageOption(subject.weightage);
  const stepField = config?.stepField || 'step';
  const resolvedStep = subject[stepField] || subject.step || config?.steps?.[0]?.value || 'STEP_1';

  return {
    ...subject,
    step: resolvedStep,
    weightage: resolvedWeightage.value,
    weightageValue: resolvedWeightage.weightageValue,
    order: Number.isFinite(Number(subject.order)) ? Number(subject.order) : 0,
    color: resolvedWeightage.defaultColor
  };
};

function AdminUnifiedSubjectsContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeCategory, setActiveCategory] = useState('plab');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStep, setActiveStep] = useState('ALL');
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [sourceSubjects, setSourceSubjects] = useState([]);
  const [importForm, setImportForm] = useState(DEFAULT_IMPORT_FORM);
  const [formData, setFormData] = useState({
    name: '',
    step: 'STEP_1',
    order: 0,
    color: '#1e3a8a',
    weightage: 'VERY HIGH WEIGHTAGE',
    weightageValue: 10
  });

  const categoryConfig = CATEGORY_CONFIG[activeCategory] || CATEGORY_CONFIG.plab;

  const sourceCategoryOptions = useMemo(() => {
    return Object.values(CATEGORY_CONFIG).filter((category) => category.id !== activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const params = new URLSearchParams(location.search);
    const categoryFromQuery = params.get('category');
    if (categoryFromQuery && CATEGORY_CONFIG[categoryFromQuery]) {
      setActiveCategory(categoryFromQuery);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setSearchTerm('');
    setActiveStep('ALL');
    fetchSubjects(activeCategory);
  }, [activeCategory]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAllSubjectsForConfig = async (config) => {
    if (!config.supportsSteps || !config.fetchAllStepsIndividually) {
      const response = await fetch(config.subjectsApi);
      const data = await response.json();
      return Array.isArray(data) ? data.map((subject) => normalizeSubject(subject, config)) : [];
    }

    const allResponses = await Promise.all(
      (config.steps || []).map(async (stepItem) => {
        const queryParam = config.stepQueryParam || 'step';
        const response = await fetch(`${config.subjectsApi}?${queryParam}=${stepItem.value}`);
        const data = await response.json();
        return Array.isArray(data)
          ? data.map((subject) => normalizeSubject({ ...subject, [config.stepField || 'step']: stepItem.value }, config))
          : [];
      })
    );

    const mergedSubjects = allResponses.flat();
    const dedupedById = new Map();
    mergedSubjects.forEach((subject) => {
      if (subject?._id) {
        dedupedById.set(subject._id, subject);
      }
    });

    return Array.from(dedupedById.values());
  };

  const fetchSubjects = async (categoryId) => {
    const config = CATEGORY_CONFIG[categoryId];
    if (!config) return;

    setLoading(true);
    try {
      const allSubjects = await fetchAllSubjectsForConfig(config);
      setSubjects(allSubjects);
    } catch (error) {
      console.error(`Error fetching ${config.label} subjects:`, error);
      showToast(`Error fetching ${config.label} subjects`, 'error');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const openModal = (subject = null) => {
    const defaultWeightage = WEIGHTAGE_OPTIONS[0];

    if (subject) {
      const selectedWeightage = getWeightageOption(subject.weightage);
      setEditingSubject(subject);
      setFormData({
        name: subject.name || '',
        step: subject.step || (categoryConfig.steps ? categoryConfig.steps[0].value : 'STEP_1'),
        order: Number.isFinite(Number(subject.order)) ? Number(subject.order) : 0,
        color: selectedWeightage.defaultColor,
        weightage: selectedWeightage.value,
        weightageValue: selectedWeightage.weightageValue
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        step: categoryConfig.steps ? categoryConfig.steps[0].value : 'STEP_1',
        order: 0,
        color: defaultWeightage.defaultColor,
        weightage: defaultWeightage.value,
        weightageValue: defaultWeightage.weightageValue
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
  };

  const openImportModal = () => {
    const fallbackSourceCategory = sourceCategoryOptions[0]?.id || 'plab';
    const defaultTargetStep = categoryConfig.supportsSteps
      ? categoryConfig.steps?.[0]?.value || 'STEP_1'
      : 'STEP_1';

    setImportForm({
      ...DEFAULT_IMPORT_FORM,
      sourceCategory: fallbackSourceCategory,
      targetStep: defaultTargetStep
    });
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setSourceSubjects([]);
    setImportForm(DEFAULT_IMPORT_FORM);
  };

  useEffect(() => {
    if (!showImportModal) return;
    if (!importForm.sourceCategory || importForm.sourceCategory === activeCategory) {
      setSourceSubjects([]);
      return;
    }

    const loadSourceSubjects = async () => {
      const sourceConfig = CATEGORY_CONFIG[importForm.sourceCategory];
      if (!sourceConfig) return;

      setImportLoading(true);
      try {
        const allSourceSubjects = await fetchAllSubjectsForConfig(sourceConfig);
        setSourceSubjects(allSourceSubjects);
      } catch (error) {
        console.error('Error fetching source subjects:', error);
        setSourceSubjects([]);
        showToast('Error loading source subjects', 'error');
      } finally {
        setImportLoading(false);
      }
    };

    loadSourceSubjects();
  }, [showImportModal, importForm.sourceCategory, activeCategory]);

  const handleImportInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setImportForm((prev) => {
      const nextValue = type === 'checkbox' ? checked : value;
      const nextState = {
        ...prev,
        [name]: nextValue
      };

      if (name === 'sourceCategory') {
        nextState.sourceSubjectId = '';
      }

      if (name === 'includeContent' && !nextValue) {
        nextState.overwriteContent = false;
      }

      return nextState;
    });
  };

  const getSubjectContentById = async (contentApi, subjectId, token, config, stepValue) => {
    const stepQueryParam = config?.stepQueryParam || 'step';
    const querySuffix = config?.supportsSteps && stepValue ? `?${stepQueryParam}=${stepValue}` : '';

    const response = await fetch(`${contentApi}/subject/${subjectId}${querySuffix}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login again', 'error');
      navigate('/admin/login');
      return;
    }

    const sourceConfig = CATEGORY_CONFIG[importForm.sourceCategory];
    if (!sourceConfig || sourceConfig.id === activeCategory) {
      showToast('Please choose a different source category', 'error');
      return;
    }

    const sourceSubject = sourceSubjects.find((subject) => subject._id === importForm.sourceSubjectId);
    if (!sourceSubject) {
      showToast('Please select a source subject', 'error');
      return;
    }

    setImportSaving(true);
    try {
      let sourceContent = null;
      if (importForm.includeContent) {
        sourceContent = await getSubjectContentById(
          sourceConfig.contentApi,
          sourceSubject._id,
          token,
          sourceConfig,
          sourceSubject.step
        );
        if (!sourceContent) {
          showToast('Selected source subject has no content to copy', 'error');
          return;
        }
      }

      const targetSubjects = await fetchAllSubjectsForConfig(categoryConfig);

      const requestedStep = categoryConfig.supportsSteps
        ? importForm.targetStep
        : undefined;

      const matchingSubject = targetSubjects.find((subject) => {
        if (normalizeName(subject.name) !== normalizeName(sourceSubject.name)) {
          return false;
        }
        if (!categoryConfig.supportsSteps) {
          return true;
        }
        return subject.step === requestedStep;
      });

      let targetSubject = matchingSubject;

      if (!targetSubject) {
        const subjectPayload = {
          name: sourceSubject.name,
          weightage: sourceSubject.weightage,
          weightageValue: getWeightageOption(sourceSubject.weightage).weightageValue,
          order: sourceSubject.order || 0,
          color: getWeightageOption(sourceSubject.weightage).defaultColor
        };

        if (categoryConfig.supportsSteps) {
          const stepField = categoryConfig.stepField || 'step';
          subjectPayload[stepField] = requestedStep;
        }

        const createSubjectResponse = await fetch(categoryConfig.subjectsApi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(subjectPayload)
        });

        if (!createSubjectResponse.ok) {
          const subjectErr = await createSubjectResponse.json();
          showToast(subjectErr.message || 'Failed to create target subject', 'error');
          return;
        }

        targetSubject = await createSubjectResponse.json();
      }

      if (importForm.includeContent && sourceContent) {
        const existingTargetContent = await getSubjectContentById(
          categoryConfig.contentApi,
          targetSubject._id,
          token,
          categoryConfig,
          requestedStep
        );

        const contentPayload = {
          title: targetSubject.name,
          description: sourceContent.description || '',
          topics: Array.isArray(sourceContent.topics)
            ? sourceContent.topics.map((topic, index) => ({
                title: topic.title || '',
                content: topic.content || '',
                videoLink: topic.videoLink || '',
                order: Number.isFinite(Number(topic.order)) ? Number(topic.order) : index
              }))
            : [],
          isPublished: sourceContent.isPublished ?? true
        };

        if (existingTargetContent) {
          if (!importForm.overwriteContent) {
            showToast('Target subject already has content. Enable overwrite to replace it.', 'error');
            return;
          }

          const updateContentResponse = await fetch(`${categoryConfig.contentApi}/${existingTargetContent._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              ...contentPayload,
              ...(categoryConfig.stepField === 'examType' ? { examType: requestedStep } : {})
            })
          });

          if (!updateContentResponse.ok) {
            const updateErr = await updateContentResponse.json();
            showToast(updateErr.message || 'Failed to overwrite target content', 'error');
            return;
          }
        } else {
          const createContentResponse = await fetch(categoryConfig.contentApi, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              ...contentPayload,
              subjectId: targetSubject._id,
              ...(categoryConfig.stepField === 'examType' ? { examType: requestedStep } : {})
            })
          });

          if (!createContentResponse.ok) {
            const contentErr = await createContentResponse.json();
            showToast(contentErr.message || 'Failed to copy content', 'error');
            return;
          }
        }
      }

      await fetchSubjects(activeCategory);
      closeImportModal();
      showToast(importForm.includeContent ? 'Subject and content imported successfully' : 'Subject imported successfully');
    } catch (error) {
      console.error('Error importing subject/content:', error);
      showToast('Error importing subject/content', 'error');
    } finally {
      setImportSaving(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'weightage') {
      const selectedWeightage = getWeightageOption(value);
      setFormData((prev) => ({
        ...prev,
        weightage: value,
        weightageValue: selectedWeightage.weightageValue,
        color: selectedWeightage.defaultColor
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

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const selectedWeightage = getWeightageOption(formData.weightage);
      const url = editingSubject
        ? `${categoryConfig.subjectsApi}/${editingSubject._id}`
        : categoryConfig.subjectsApi;
      const method = editingSubject ? 'PUT' : 'POST';

      const stepField = categoryConfig.stepField || 'step';
      const payload = categoryConfig.supportsSteps
        ? {
            name: formData.name.trim(),
        [stepField]: formData.step,
            weightage: formData.weightage,
            weightageValue: selectedWeightage.weightageValue,
            order: formData.order,
            color: selectedWeightage.defaultColor
          }
        : {
            name: formData.name.trim(),
            weightage: formData.weightage,
            weightageValue: selectedWeightage.weightageValue,
            order: formData.order,
            color: selectedWeightage.defaultColor
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        showToast(err.message || 'Failed to save subject', 'error');
        return;
      }

      await fetchSubjects(activeCategory);
      closeModal();
      showToast(editingSubject ? 'Subject updated successfully' : 'Subject created successfully');
    } catch (error) {
      console.error('Error saving subject:', error);
      showToast('Error saving subject', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subjectId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${categoryConfig.subjectsApi}/${subjectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        showToast('Failed to delete subject', 'error');
        return;
      }

      await fetchSubjects(activeCategory);
      showToast('Subject deleted successfully');
    } catch (error) {
      console.error('Error deleting subject:', error);
      showToast('Error deleting subject', 'error');
    }
  };

  const filteredSubjects = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    return subjects
      .filter((subject) => subject.name.toLowerCase().includes(lowerSearch))
      .filter((subject) => {
        if (!categoryConfig.supportsSteps || activeStep === 'ALL') return true;
        return subject.step === activeStep;
      })
      .sort((a, b) => {
        if (categoryConfig.supportsSteps) {
          if (a.step !== b.step) {
            return a.step.localeCompare(b.step);
          }
          if ((a.weightageValue || 0) !== (b.weightageValue || 0)) {
            return (b.weightageValue || 0) - (a.weightageValue || 0);
          }
          if ((a.order || 0) !== (b.order || 0)) {
            return (a.order || 0) - (b.order || 0);
          }
          return a.name.localeCompare(b.name);
        }

        if ((a.weightageValue || 0) !== (b.weightageValue || 0)) {
          return (b.weightageValue || 0) - (a.weightageValue || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [subjects, searchTerm, categoryConfig.supportsSteps, activeStep]);

  return (
    <div className="unified-admin-wrap">
      <header className="unified-admin-header">
        <div>
          <h1>Unified Subjects and Content Admin</h1>
          <p>Manage subjects and open subject content editor for PLAB, USMLE, and AMC in one place.</p>
        </div>

        <div className="unified-header-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <section className="category-tabs">
        {Object.values(CATEGORY_CONFIG).map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </section>

      {categoryConfig.supportsSteps && (
        <section className="step-tabs">
          <button
            className={`step-tab ${activeStep === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveStep('ALL')}
          >
            {activeCategory === 'plab' ? 'All Types' : 'All Steps'}
          </button>
          {categoryConfig.steps.map((stepItem) => (
            <button
              key={stepItem.value}
              className={`step-tab ${activeStep === stepItem.value ? 'active' : ''}`}
              onClick={() => setActiveStep(stepItem.value)}
            >
              {stepItem.label}
            </button>
          ))}
        </section>
      )}

      <section className="subject-controls">
        <input
          type="text"
          placeholder={`Search ${categoryConfig.label} subjects...`}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="subject-search"
        />
        <div className="subject-controls-actions">
          <button className="btn-secondary" onClick={openImportModal}>
            Import From Another Bank
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            Add Subject
          </button>
        </div>
      </section>

      <section className="subject-table-wrap">
        {loading ? (
          <p className="empty-state">Loading {categoryConfig.label} subjects...</p>
        ) : filteredSubjects.length === 0 ? (
          <p className="empty-state">No subjects found.</p>
        ) : (
          <table className="subject-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Category</th>
                {categoryConfig.supportsSteps && <th>Step</th>}
                <th>Weightage</th>
                <th>Order</th>
                <th>Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.name}</td>
                  <td>{categoryConfig.label}</td>
                  {categoryConfig.supportsSteps && (
                    <td>{categoryConfig.steps.find((stepItem) => stepItem.value === subject.step)?.label || subject.step}</td>
                  )}
                  <td>{subject.weightage || 'MODERATE WEIGHTAGE'}</td>
                  <td>{subject.order || 0}</td>
                  <td>
                    <span className="color-pill" style={{ backgroundColor: subject.color || '#1e3a8a' }} />
                    {subject.color || '#1e3a8a'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" onClick={() => openModal(subject)}>
                        Edit Subject
                      </button>
                      <button className="btn-primary btn-content" onClick={() => navigate(categoryConfig.contentPath(subject._id, subject.step))}>
                        Edit Content
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(subject._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content subject-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{editingSubject ? `Edit ${categoryConfig.label} Subject` : `Add ${categoryConfig.label} Subject`}</h3>
            <p className="modal-subtitle">
              Configure subject details, exam classification, and display settings.
            </p>

            <form onSubmit={handleSubmit} className="subject-form">
              <section className="subject-form-section">
                <h4>Subject Details</h4>
                <div className="form-group">
                  <label htmlFor="name">Subject Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Cardiovascular System"
                    required
                  />
                </div>
              </section>

              <section className="subject-form-section">
                <h4>Classification</h4>
                <div className="form-grid two-col">
                  {categoryConfig.supportsSteps && (
                    <div className="form-group">
                      <label htmlFor="step">Step</label>
                      <select id="step" name="step" value={formData.step} onChange={handleInputChange}>
                        {categoryConfig.steps.map((stepItem) => (
                          <option key={stepItem.value} value={stepItem.value}>
                            {stepItem.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="weightage">Weightage</label>
                    <select id="weightage" name="weightage" value={formData.weightage} onChange={handleInputChange}>
                      {WEIGHTAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="subject-form-section">
                <h4>Display Settings</h4>
                <div className="form-grid two-col">
                  <div className="form-group">
                    <label htmlFor="order">Display Order</label>
                    <input
                      id="order"
                      name="order"
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group color-field-group">
                    <label>Card Accent Color</label>
                    <div className="color-input-wrap">
                      <span className="color-pill" style={{ backgroundColor: formData.color }} />
                      <span>{formData.color}</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>Import Subject Into {categoryConfig.label}</h3>

            <form onSubmit={handleImportSubmit}>
              <div className="form-group">
                <label htmlFor="sourceCategory">Source Bank</label>
                <select
                  id="sourceCategory"
                  name="sourceCategory"
                  value={importForm.sourceCategory}
                  onChange={handleImportInputChange}
                  required
                >
                  {sourceCategoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sourceSubjectId">Source Subject</label>
                <select
                  id="sourceSubjectId"
                  name="sourceSubjectId"
                  value={importForm.sourceSubjectId}
                  onChange={handleImportInputChange}
                  required
                  disabled={importLoading}
                >
                  <option value="">{importLoading ? 'Loading subjects...' : 'Select a subject'}</option>
                  {sourceSubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                      {subject.step ? ` (${subject.step.replace('_', ' ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {categoryConfig.supportsSteps && (
                <div className="form-group">
                  <label htmlFor="targetStep">Target Step</label>
                  <select
                    id="targetStep"
                    name="targetStep"
                    value={importForm.targetStep}
                    onChange={handleImportInputChange}
                    required
                  >
                    {categoryConfig.steps.map((stepItem) => (
                      <option key={stepItem.value} value={stepItem.value}>
                        {stepItem.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="import-options-wrap">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="includeContent"
                    checked={importForm.includeContent}
                    onChange={handleImportInputChange}
                  />
                  Copy subject content topics too
                </label>

                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    name="overwriteContent"
                    checked={importForm.overwriteContent}
                    onChange={handleImportInputChange}
                    disabled={!importForm.includeContent}
                  />
                  Overwrite existing target content (if already present)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeImportModal} disabled={importSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={importSaving || importLoading}>
                  {importSaving ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUnifiedSubjectsContent;
