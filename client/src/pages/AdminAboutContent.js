import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPlabContent.css';
import API_BASE_URL from '../config/api';

const defaultSections = [
  {
    heading: 'Who We Are',
    content:
      'Enhance Medical Education is dedicated to helping medical students master their licensing and professional exams. We provide comprehensive study materials, practice questions, and expert-led courses covering all major medical subjects.',
    order: 1
  },
  {
    heading: 'How We Help',
    content:
      'Our platform combines innovative learning techniques with real-world medical knowledge to ensure you are fully prepared for your exams.',
    order: 2
  }
];

const AdminAboutContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionModalMode, setSectionModalMode] = useState('add');
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [sectionForm, setSectionForm] = useState({ heading: '', content: '', order: 1 });
  const [formData, setFormData] = useState({
    title: 'About us',
    sections: defaultSections,
    isPublished: true
  });

  const showNotification = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
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

    fetchAboutContent();
  }, [navigate]);

  const fetchAboutContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/about-content/admin/home-about`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setEditingContent(null);
        setFormData({
          title: 'About us',
          sections: defaultSections,
          isPublished: true
        });
        return;
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load About Us content');
      }

      const content = data.data;
      setEditingContent(content);
      setFormData({
        title: content.title || 'About us',
        sections: content.sections?.length ? content.sections : defaultSections,
        isPublished: content.isPublished ?? true
      });
    } catch (error) {
      console.error('Error fetching About Us content:', error);
      showNotification('Could not load About Us content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setActiveSectionIndex(null);
    setSectionForm({ heading: '', content: '', order: 1 });
  };

  const openAddSectionModal = () => {
    setSectionModalMode('add');
    setActiveSectionIndex(null);
    setSectionForm({ heading: '', content: '', order: formData.sections.length + 1 });
    setShowSectionModal(true);
  };

  const openEditSectionModal = (index) => {
    const section = formData.sections[index];
    setSectionModalMode('edit');
    setActiveSectionIndex(index);
    setSectionForm({
      heading: section.heading || '',
      content: section.content || '',
      order: section.order || index + 1
    });
    setShowSectionModal(true);
  };

  const openDeleteSectionModal = (index) => {
    setSectionModalMode('delete');
    setActiveSectionIndex(index);
    setShowSectionModal(true);
  };

  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;
    setSectionForm((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 1 : value
    }));
  };

  const saveContent = async (updatedSections, successMessage) => {
    const token = localStorage.getItem('token');

    setSavingSection(true);

    try {
      const payload = {
        title: formData.title || 'About us',
        sections: updatedSections,
        isPublished: true
      };

      const endpoint = editingContent?._id
        ? `${API_BASE_URL}/api/about-content/${editingContent._id}`
        : `${API_BASE_URL}/api/about-content`;
      const method = editingContent?._id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
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
        title: updatedContent.title || 'About us',
        sections: updatedContent.sections || [],
        isPublished: updatedContent.isPublished ?? true
      });

      showNotification(successMessage, 'success');
      return true;
    } catch (error) {
      console.error('Error saving About Us content:', error);
      showNotification('Error saving About Us content', 'error');
      return false;
    } finally {
      setSavingSection(false);
    }
  };

  const handleSectionModalSubmit = async () => {
    if (savingSection) {
      return;
    }

    if (sectionModalMode === 'delete') {
      const updatedSections = formData.sections.filter((_, i) => i !== activeSectionIndex);
      const isSaved = await saveContent(updatedSections, 'Section deleted successfully!');
      if (isSaved) {
        closeSectionModal();
      }
      return;
    }

    if (!sectionForm.heading.trim() || !sectionForm.content.trim()) {
      showNotification('Heading and content are required.', 'error');
      return;
    }

    if (sectionModalMode === 'add') {
      const updatedSections = [
        ...formData.sections,
        {
          heading: sectionForm.heading.trim(),
          content: sectionForm.content.trim(),
          order: sectionForm.order || formData.sections.length + 1
        }
      ];

      const isSaved = await saveContent(updatedSections, 'Section added successfully!');
      if (isSaved) {
        closeSectionModal();
      }
      return;
    }

    if (sectionModalMode === 'edit' && activeSectionIndex !== null) {
      const updatedSections = [...formData.sections];
      updatedSections[activeSectionIndex] = {
        ...updatedSections[activeSectionIndex],
        heading: sectionForm.heading.trim(),
        content: sectionForm.content.trim(),
        order: sectionForm.order || activeSectionIndex + 1
      };

      const isSaved = await saveContent(updatedSections, 'Section updated successfully!');
      if (isSaved) {
        closeSectionModal();
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-plab-content">
      <div className="admin-header">
        <h1>Edit "About us" Section</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Back to Admin Dashboard
        </button>
      </div>

      <div className="content-form-container">
        <h2>Manage About Us Details</h2>
        <div className="content-form">
          <div className="sections-container">
            <div className="sections-header">
              <h3>About Us Sections</h3>
              <button type="button" onClick={openAddSectionModal} className="add-section-button">
                + Add Section
              </button>
            </div>

            {formData.sections.map((section, index) => (
              <div key={index} className="section-item">
                <div className="section-header">
                  <h4>Section {index + 1}</h4>
                  <div className="section-actions">
                    <button
                      type="button"
                      onClick={() => openEditSectionModal(index)}
                      className="section-action-button update-section-button"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteSectionModal(index)}
                      className="section-action-button delete-section-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="section-heading-preview">{section.heading}</p>
                <div className="section-content-preview">
                  <p>{section.content}</p>
                </div>
                <p className="section-order-preview">Display order: {section.order || index + 1}</p>
              </div>
            ))}

            {formData.sections.length === 0 && (
              <p className="no-sections-message">No sections added yet. Click "Add Section" to create one.</p>
            )}
          </div>
        </div>
      </div>

      {showSectionModal && (
        <div className="section-modal-overlay" onClick={closeSectionModal}>
          <div className="section-modal" onClick={(e) => e.stopPropagation()}>
            {sectionModalMode === 'delete' ? (
              <>
                <h3>Delete Section</h3>
                <p className="section-modal-text">
                  Are you sure you want to delete section {activeSectionIndex !== null ? activeSectionIndex + 1 : ''}?
                </p>
                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeSectionModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="modal-delete-button"
                    onClick={handleSectionModalSubmit}
                    disabled={savingSection}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{sectionModalMode === 'add' ? 'Add Section Details' : 'Update Section Details'}</h3>

                <div className="form-group">
                  <label>Heading</label>
                  <input
                    type="text"
                    name="heading"
                    value={sectionForm.heading}
                    onChange={handleSectionFormChange}
                    placeholder="Enter section heading"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    name="content"
                    value={sectionForm.content}
                    onChange={handleSectionFormChange}
                    rows={6}
                    placeholder="Enter section content"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    name="order"
                    value={sectionForm.order}
                    onChange={handleSectionFormChange}
                  />
                </div>

                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeSectionModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="modal-save-button"
                    onClick={handleSectionModalSubmit}
                    disabled={savingSection}
                  >
                    {savingSection ? 'Saving...' : sectionModalMode === 'add' ? 'Add Section' : 'Update Section'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPopup && <div className={`popup-notification ${popupType}`}>{popupMessage}</div>}
    </div>
  );
};

export default AdminAboutContent;
