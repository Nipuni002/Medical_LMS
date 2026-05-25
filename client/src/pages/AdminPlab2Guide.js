import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './AdminPlabContent.css';

const DEFAULT_FORM_DATA = {
  pageType: 'plab2-tips',
  title: 'Guide to PLAB-2',
  subtitle: 'Clinical Skills (OSCE) overview for international medical graduates',
  description:
    'The PLAB 2 is a practical Objective Structured Clinical Examination (OSCE) designed to simulate real-world medical scenarios an FY2 doctor might face in the UK.',
  sections: [],
  isPublished: true
};

const AdminPlab2Guide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [savingSection, setSavingSection] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionModalMode, setSectionModalMode] = useState('add');
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [sectionForm, setSectionForm] = useState({ heading: '', content: '', order: 1 });
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  const editorModules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean']
    ]
  };

  const editorFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'blockquote',
    'link'
  ];

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

    fetchPlab2GuideContent();
  }, [navigate]);

  const fetchPlab2GuideContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/plab-content/plab2-tips', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

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
      console.error('Error fetching PLAB-2 guide content:', error);
      setEditingContent(null);
      setFormData(DEFAULT_FORM_DATA);
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

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;
    setSectionForm((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 1 : value
    }));
  };

  const handleSectionContentChange = (value) => {
    setSectionForm((prev) => ({ ...prev, content: value }));
  };

  const getPlainTextFromHtml = (htmlContent = '') =>
    htmlContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const persistContent = async (payload, successMessage) => {
    const token = localStorage.getItem('token');
    const url = editingContent?._id
      ? `http://localhost:5000/api/plab-content/${editingContent._id}`
      : 'http://localhost:5000/api/plab-content';
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
      console.error('Error saving PLAB-2 guide content:', error);
      showNotification('Error saving guide content', 'error');
      return false;
    }
  };

  const saveGuideDetails = async () => {
    if (savingDetails || savingSection) {
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Guide title and intro description are required.', 'error');
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
      editingContent?._id ? 'Guide details updated successfully!' : 'Guide created successfully!'
    );
    setSavingDetails(false);
  };

  const saveSections = async (updatedSections, successMessage) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification('Please add guide title and intro description before saving sections.', 'error');
      return false;
    }

    setSavingSection(true);
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
    setSavingSection(false);
    return isSaved;
  };

  const handleSectionModalSubmit = async () => {
    if (savingSection || savingDetails) {
      return;
    }

    let updatedSections = [];

    if (sectionModalMode === 'delete') {
      updatedSections = formData.sections.filter((_, i) => i !== activeSectionIndex);
      const isSaved = await saveSections(updatedSections, 'Guide section deleted successfully!');

      if (isSaved) {
        closeSectionModal();
      }

      return;
    }

    if (!sectionForm.heading.trim() || !getPlainTextFromHtml(sectionForm.content)) {
      showNotification('Section heading and content are required.', 'error');
      return;
    }

    if (sectionModalMode === 'add') {
      updatedSections = [
        ...formData.sections,
        {
          heading: sectionForm.heading.trim(),
          content: sectionForm.content,
          order: sectionForm.order || formData.sections.length + 1
        }
      ];

      const isSaved = await saveSections(updatedSections, 'Guide section added successfully!');

      if (isSaved) {
        closeSectionModal();
      }

      return;
    }

    if (sectionModalMode === 'edit' && activeSectionIndex !== null) {
      updatedSections = [...formData.sections];
      updatedSections[activeSectionIndex] = {
        ...updatedSections[activeSectionIndex],
        heading: sectionForm.heading.trim(),
        content: sectionForm.content,
        order: sectionForm.order || activeSectionIndex + 1
      };

      const isSaved = await saveSections(updatedSections, 'Guide section updated successfully!');

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
        <h1>Edit PLAB-2 Guide Content</h1>
        <button onClick={() => navigate('/admin/dashboard?section=plab-admin')} className="back-button">
          ← Back to PLAB Admin Section
        </button>
      </div>

      <div className="content-form-container">
        <h2>Guide Hero & Intro</h2>
        <div className="content-form">
          <div className="form-group">
            <label>Guide Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormDataChange}
              placeholder="Enter PLAB-2 guide title"
            />
          </div>

          <div className="form-group">
            <label>Guide Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleFormDataChange}
              placeholder="Enter guide subtitle"
            />
          </div>

          <div className="form-group">
            <label>Intro Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormDataChange}
              rows="4"
              placeholder="Enter intro paragraph shown in first card"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="submit-button" onClick={saveGuideDetails} disabled={savingDetails || savingSection}>
              {savingDetails ? 'Saving...' : (editingContent?._id ? 'Update Guide Details' : 'Create Guide')}
            </button>
          </div>
        </div>
      </div>

      <div className="content-form-container">
        <h2>Guide Sections</h2>
        <div className="content-form">
          <div className="sections-container">
            <div className="sections-header">
              <h3>Sections</h3>
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
                <div className="section-content-preview" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                <p className="section-order-preview">Display order: {section.order || index + 1}</p>
              </div>
            ))}

            {formData.sections.length === 0 && (
              <p className="no-sections-message">No guide sections added yet. Click "Add Section" to create one.</p>
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
                  <button type="button" className="modal-delete-button" onClick={handleSectionModalSubmit} disabled={savingSection}>
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
                  <div className="section-editor-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={sectionForm.content}
                      onChange={handleSectionContentChange}
                      modules={editorModules}
                      formats={editorFormats}
                      placeholder="Write section content here..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={sectionForm.order}
                    onChange={handleSectionFormChange}
                    min="1"
                  />
                </div>

                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeSectionModal}>
                    Cancel
                  </button>
                  <button type="button" className="modal-save-button" onClick={handleSectionModalSubmit} disabled={savingSection}>
                    {savingSection ? 'Saving...' : (sectionModalMode === 'add' ? 'Add Section' : 'Update Section')}
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

export default AdminPlab2Guide;