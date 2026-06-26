import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './AdminPlabContent.css';

function AdminUSMLEIntroductionContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionModalMode, setSectionModalMode] = useState('add');
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [contentId, setContentId] = useState(null);

  const [sectionForm, setSectionForm] = useState({ heading: '', content: '', order: 1 });
  const [formData, setFormData] = useState({
    title: 'USMLE Step 1 Introduction',
    subtitle: 'Orientation before beginning Step 1 subjects',
    sections: [],
    isPublished: true
  });

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
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchIntroductionContent(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIntroductionContent = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usmle-introduction-content/admin/step1`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setContentId(data.data._id || null);
        setFormData({
          title: data.data.title || 'USMLE Step 1 Introduction',
          subtitle: data.data.subtitle || '',
          sections: data.data.sections || [],
          isPublished: data.data.isPublished ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching USMLE introduction content:', error);
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
    if (!section) return;

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

  const handleSectionFormChange = (event) => {
    const { name, value } = event.target;
    setSectionForm((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 1 : value
    }));
  };

  const handleSectionContentChange = (value) => {
    setSectionForm((prev) => ({ ...prev, content: value }));
  };

  const getPlainTextFromHtml = (html = '') =>
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const saveAllContent = async (updatedSections, successMessage) => {
    const token = localStorage.getItem('token');

    setSavingSection(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/usmle-introduction-content/step1`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          sections: updatedSections,
          isPublished: formData.isPublished
        })
      });

      const data = await response.json();
      if (!data.success) {
        showNotification(data.message || 'Failed to save introduction content', 'error');
        return false;
      }

      setContentId(data.data?._id || contentId);
      setFormData({
        title: data.data?.title || formData.title,
        subtitle: data.data?.subtitle || formData.subtitle,
        sections: data.data?.sections || updatedSections,
        isPublished: data.data?.isPublished ?? formData.isPublished
      });

      if (successMessage) {
        showNotification(successMessage, 'success');
      }

      return true;
    } catch (error) {
      console.error('Error saving USMLE introduction content:', error);
      showNotification('Error saving introduction content', 'error');
      return false;
    } finally {
      setSavingSection(false);
    }
  };

  const handleSectionModalSubmit = async () => {
    if (savingSection) return;

    if (sectionModalMode === 'delete') {
      const updatedSections = formData.sections.filter((_, index) => index !== activeSectionIndex);
      const isSaved = await saveAllContent(updatedSections, 'Section deleted successfully');
      if (isSaved) closeSectionModal();
      return;
    }

    if (!sectionForm.heading.trim() || !getPlainTextFromHtml(sectionForm.content)) {
      showNotification('Heading and content are required.', 'error');
      return;
    }

    if (sectionModalMode === 'add') {
      const updatedSections = [
        ...formData.sections,
        {
          heading: sectionForm.heading.trim(),
          content: sectionForm.content,
          order: sectionForm.order || formData.sections.length + 1
        }
      ];

      const isSaved = await saveAllContent(updatedSections, 'Section added successfully');
      if (isSaved) closeSectionModal();
      return;
    }

    if (sectionModalMode === 'edit' && activeSectionIndex !== null) {
      const updatedSections = [...formData.sections];
      updatedSections[activeSectionIndex] = {
        ...updatedSections[activeSectionIndex],
        heading: sectionForm.heading.trim(),
        content: sectionForm.content,
        order: sectionForm.order || activeSectionIndex + 1
      };

      const isSaved = await saveAllContent(updatedSections, 'Section updated successfully');
      if (isSaved) closeSectionModal();
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-plab-content">
      <div className="admin-header">
        <h1>Edit USMLE Step 1 Introduction</h1>
        <button onClick={() => navigate('/admin/dashboard?section=usmle-admin')} className="back-button">
          ← Back to USMLE Admin Section
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="content-form-container">
        <h2>Introduction Content</h2>

        <div className="content-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="USMLE Step 1 Introduction"
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
              placeholder="Orientation before beginning Step 1 subjects"
            />
          </div>

          <div className="sections-container">
            <div className="sections-header">
              <h3>Sections</h3>
              <button type="button" onClick={openAddSectionModal} className="add-section-button">
                + Add Section
              </button>
            </div>

            {formData.sections.map((section, index) => (
              <div key={`${section._id || 'section'}-${index}`} className="section-item">
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
                <div
                  className="section-content-preview"
                  dangerouslySetInnerHTML={{ __html: section.content || '' }}
                />
                <p className="section-order-preview">Display order: {section.order || index + 1}</p>
              </div>
            ))}

            {formData.sections.length === 0 && (
              <p className="no-sections-message">No sections added yet. Click "Add Section" to create one.</p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="submit-button"
              onClick={() => saveAllContent(formData.sections, contentId ? 'Content updated successfully!' : 'Content created successfully!')}
              disabled={savingSection}
            >
              {savingSection ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>

      {showSectionModal && (
        <div className="section-modal-overlay" onClick={closeSectionModal}>
          <div className="section-modal" onClick={(event) => event.stopPropagation()}>
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
                  />
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <ReactQuill
                    theme="snow"
                    value={sectionForm.content}
                    onChange={handleSectionContentChange}
                    modules={editorModules}
                    formats={editorFormats}
                    placeholder="Write section content"
                  />
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    name="order"
                    min="1"
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
                    {sectionModalMode === 'add' ? 'Add Section' : 'Update Section'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUSMLEIntroductionContent;
