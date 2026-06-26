import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import './AdminPlabContent.css';

const DEFAULT_FORM_DATA = {
  pageType: 'plab2-pretest-scenarios',
  title: 'PLAB-2 Pretest Scenarios',
  subtitle: 'Practice communication and clinical reasoning station by station',
  description:
    'Read each scenario, write your answer, and then reveal the ideal answer to compare your approach.',
  sections: [],
  isPublished: true
};

const EMPTY_SCENARIO_FORM = {
  heading: '',
  content: '',
  order: 1
};

const AdminPlab2Pretest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [savingScenario, setSavingScenario] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [scenarioModalMode, setScenarioModalMode] = useState('add');
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(null);
  const [scenarioForm, setScenarioForm] = useState(EMPTY_SCENARIO_FORM);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const showNotification = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      showNotification('Access denied. Admin only.', 'error');
      navigate('/');
      return;
    }

    fetchPretestContent();
  }, [navigate]);

  const fetchPretestContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/plab-content/plab2-pretest-scenarios`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setEditingContent(null);
        setFormData(DEFAULT_FORM_DATA);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        const content = data.data;
        setEditingContent(content);
        setFormData({
          pageType: content.pageType,
          title: content.title || DEFAULT_FORM_DATA.title,
          subtitle: content.subtitle || '',
          description: content.description || DEFAULT_FORM_DATA.description,
          sections: content.sections || [],
          isPublished: content.isPublished
        });
      } else {
        setEditingContent(null);
        setFormData(DEFAULT_FORM_DATA);
      }
    } catch (error) {
      console.error('Error fetching PLAB-2 pretest content:', error);
      setEditingContent(null);
      setFormData(DEFAULT_FORM_DATA);
    } finally {
      setLoading(false);
    }
  };

  const closeScenarioModal = () => {
    setShowScenarioModal(false);
    setActiveScenarioIndex(null);
    setScenarioForm(EMPTY_SCENARIO_FORM);
  };

  const openAddScenarioModal = () => {
    setScenarioModalMode('add');
    setActiveScenarioIndex(null);
    setScenarioForm({ ...EMPTY_SCENARIO_FORM, order: formData.sections.length + 1 });
    setShowScenarioModal(true);
  };

  const openEditScenarioModal = (index) => {
    const scenario = formData.sections[index];
    setScenarioModalMode('edit');
    setActiveScenarioIndex(index);
    setScenarioForm({
      heading: scenario.heading || '',
      content: scenario.content || '',
      order: scenario.order || index + 1
    });
    setShowScenarioModal(true);
  };

  const openDeleteScenarioModal = (index) => {
    setScenarioModalMode('delete');
    setActiveScenarioIndex(index);
    setShowScenarioModal(true);
  };

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScenarioFormChange = (e) => {
    const { name, value } = e.target;
    setScenarioForm((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 1 : value
    }));
  };

  const persistContent = async (payload, successMessage) => {
    const token = localStorage.getItem('token');
    const url = editingContent?._id
      ? `${API_BASE_URL}/api/plab-content/${editingContent._id}`
      : `${API_BASE_URL}/api/plab-content`;
    const method = editingContent?._id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        showNotification('Error: ' + data.error, 'error');
        return false;
      }

      const updatedContent = data.data;
      setEditingContent(updatedContent);
      setFormData({
        pageType: updatedContent.pageType,
        title: updatedContent.title || DEFAULT_FORM_DATA.title,
        subtitle: updatedContent.subtitle || '',
        description: updatedContent.description || DEFAULT_FORM_DATA.description,
        sections: updatedContent.sections || [],
        isPublished: updatedContent.isPublished
      });

      showNotification(successMessage, 'success');
      return true;
    } catch (error) {
      console.error('Error saving PLAB-2 pretest content:', error);
      showNotification('Error saving pretest content', 'error');
      return false;
    }
  };

  const savePretestDetails = async () => {
    if (savingDetails || savingScenario) {
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Page title and intro description are required.', 'error');
      return;
    }

    setSavingDetails(true);
    await persistContent(
      {
        ...formData,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        sections: formData.sections || []
      },
      editingContent?._id ? 'Pretest details updated successfully!' : 'Pretest page created successfully!'
    );
    setSavingDetails(false);
  };

  const saveScenarios = async (updatedSections, successMessage) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Please add page title and intro description before saving scenarios.', 'error');
      return false;
    }

    setSavingScenario(true);
    const isSaved = await persistContent(
      {
        ...formData,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        sections: updatedSections
      },
      successMessage
    );
    setSavingScenario(false);
    return isSaved;
  };

  const handleScenarioModalSubmit = async () => {
    if (savingScenario || savingDetails) {
      return;
    }

    let updatedSections = [];

    if (scenarioModalMode === 'delete') {
      updatedSections = formData.sections.filter((_, i) => i !== activeScenarioIndex);
      const isSaved = await saveScenarios(updatedSections, 'Scenario deleted successfully!');

      if (isSaved) {
        closeScenarioModal();
      }

      return;
    }

    if (!scenarioForm.heading.trim() || !scenarioForm.content.trim()) {
      showNotification('Scenario question and ideal answer are required.', 'error');
      return;
    }

    if (scenarioModalMode === 'add') {
      updatedSections = [
        ...formData.sections,
        {
          heading: scenarioForm.heading.trim(),
          content: scenarioForm.content.trim(),
          order: scenarioForm.order || formData.sections.length + 1
        }
      ];

      const isSaved = await saveScenarios(updatedSections, 'Scenario added successfully!');

      if (isSaved) {
        closeScenarioModal();
      }

      return;
    }

    if (scenarioModalMode === 'edit' && activeScenarioIndex !== null) {
      updatedSections = [...formData.sections];
      updatedSections[activeScenarioIndex] = {
        ...updatedSections[activeScenarioIndex],
        heading: scenarioForm.heading.trim(),
        content: scenarioForm.content.trim(),
        order: scenarioForm.order || activeScenarioIndex + 1
      };

      const isSaved = await saveScenarios(updatedSections, 'Scenario updated successfully!');

      if (isSaved) {
        closeScenarioModal();
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  const sortedScenarios = (formData.sections || [])
    .map((scenario, index) => ({
      ...scenario,
      originalIndex: index
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="admin-plab-content">
      <div className="admin-header">
        <h1>Edit PLAB-2 Pretest Scenarios</h1>
        <button onClick={() => navigate('/admin/dashboard?section=plab-admin')} className="back-button">
          ← Back to PLAB Admin Section
        </button>
      </div>

      <div className="content-form-container">
        <h2>Page Header & Intro</h2>
        <div className="content-form">
          <div className="form-group">
            <label>Page Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormDataChange}
              placeholder="Enter pretest page title"
            />
          </div>

          <div className="form-group">
            <label>Page Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleFormDataChange}
              placeholder="Enter pretest subtitle"
            />
          </div>

          <div className="form-group">
            <label>Intro Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormDataChange}
              rows="4"
              placeholder="Enter intro paragraph"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="submit-button" onClick={savePretestDetails} disabled={savingDetails || savingScenario}>
              {savingDetails ? 'Saving...' : (editingContent?._id ? 'Update Page Details' : 'Create Page')}
            </button>
          </div>
        </div>
      </div>

      <div className="content-form-container">
        <h2>Scenario Bank</h2>
        <div className="content-form">
          <div className="sections-container">
            <div className="sections-header">
              <h3>Scenarios</h3>
              <button type="button" onClick={openAddScenarioModal} className="add-section-button">
                + Add Scenario
              </button>
            </div>

            {sortedScenarios.map((scenario, index) => (
              <div key={scenario._id || `${scenario.order}-${scenario.originalIndex}`} className="section-item">
                <div className="section-header">
                  <h4>Scenario {index + 1}</h4>
                  <div className="section-actions">
                    <button
                      type="button"
                      onClick={() => openEditScenarioModal(scenario.originalIndex)}
                      className="section-action-button update-section-button"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteScenarioModal(scenario.originalIndex)}
                      className="section-action-button delete-section-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="section-heading-preview">Question: {scenario.heading}</p>
                <div className="section-content-preview">
                  <strong>Ideal Answer:</strong>
                  <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{scenario.content}</p>
                </div>
                <p className="section-order-preview">Display order: {scenario.order || index + 1}</p>
              </div>
            ))}

            {sortedScenarios.length === 0 && (
              <p className="no-sections-message">No scenarios added yet. Click "Add Scenario" to create one.</p>
            )}
          </div>
        </div>
      </div>

      {showScenarioModal && (
        <div className="section-modal-overlay" onClick={closeScenarioModal}>
          <div className="section-modal" onClick={(e) => e.stopPropagation()}>
            {scenarioModalMode === 'delete' ? (
              <>
                <h3>Delete Scenario</h3>
                <p className="section-modal-text">
                  Are you sure you want to delete scenario {activeScenarioIndex !== null ? activeScenarioIndex + 1 : ''}?
                </p>
                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeScenarioModal}>
                    Cancel
                  </button>
                  <button type="button" className="modal-delete-button" onClick={handleScenarioModalSubmit} disabled={savingScenario}>
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{scenarioModalMode === 'add' ? 'Add Scenario' : 'Update Scenario'}</h3>

                <div className="form-group">
                  <label>Scenario Question</label>
                  <textarea
                    name="heading"
                    value={scenarioForm.heading}
                    onChange={handleScenarioFormChange}
                    rows="6"
                    placeholder="Enter full scenario task/question"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ideal Answer</label>
                  <textarea
                    name="content"
                    value={scenarioForm.content}
                    onChange={handleScenarioFormChange}
                    rows="8"
                    placeholder="Enter the ideal answer shown after clicking Show Answer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={scenarioForm.order}
                    onChange={handleScenarioFormChange}
                    min="1"
                  />
                </div>

                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeScenarioModal}>
                    Cancel
                  </button>
                  <button type="button" className="modal-save-button" onClick={handleScenarioModalSubmit} disabled={savingScenario}>
                    {savingScenario ? 'Saving...' : (scenarioModalMode === 'add' ? 'Add Scenario' : 'Update Scenario')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPopup && (
        <div className={`popup-notification ${popupType}`}>
          <div className="popup-content">
            <span className="popup-icon">{popupType === 'success' ? '✓' : '✕'}</span>
            <p className="popup-message">{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlab2Pretest;
