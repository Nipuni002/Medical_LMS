import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import './AdminPlabContent.css';

const defaultContactData = {
  title: 'Contact Us',
  subtitle: 'Access free medical education resources and support',
  supportHeading: 'Educational Support',
  supportEmail: 'education@enhancemedical.com',
  freeResources: [
    {
      title: 'Free Study Materials',
      description: 'Comprehensive library of medical study resources',
      order: 1
    },
    {
      title: 'Practice Questions',
      description: 'Thousands of free questions for medical exams',
      order: 2
    }
  ],
  faqs: [
    {
      question: 'Are all courses free?',
      answer: 'Yes! All medical education courses and materials are completely free.',
      order: 1
    },
    {
      question: 'How do I access resources?',
      answer: 'Browse our website - all materials are available instantly without registration.',
      order: 2
    },
    {
      question: 'Can I download materials?',
      answer: 'Yes, most materials are available for download in PDF format.',
      order: 3
    }
  ],
  isPublished: true
};

const AdminContactContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceModalMode, setResourceModalMode] = useState('add');
  const [activeResourceIndex, setActiveResourceIndex] = useState(null);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', order: 1 });
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState('add');
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', order: 1 });
  const [formData, setFormData] = useState(defaultContactData);

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

    fetchContactContent();
  }, [navigate]);

  const fetchContactContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contact-content/admin/home-contact`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setEditingContent(null);
        setFormData(defaultContactData);
        return;
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load Contact Us content');
      }

      const content = data.data;
      setEditingContent(content);
      setFormData({
        title: content.title || defaultContactData.title,
        subtitle: content.subtitle || defaultContactData.subtitle,
        supportHeading: content.supportHeading || defaultContactData.supportHeading,
        supportEmail: content.supportEmail || defaultContactData.supportEmail,
        freeResources: content.freeResources?.length ? content.freeResources : defaultContactData.freeResources,
        faqs: content.faqs?.length ? content.faqs : defaultContactData.faqs,
        isPublished: content.isPublished ?? true
      });
    } catch (error) {
      console.error('Error fetching Contact Us content:', error);
      showNotification('Could not load Contact Us content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (nextData, successMessage) => {
    const token = localStorage.getItem('token');
    setSaving(true);

    try {
      const endpoint = editingContent?._id
        ? `${API_BASE_URL}/api/contact-content/${editingContent._id}`
        : `${API_BASE_URL}/api/contact-content`;
      const method = editingContent?._id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...nextData, isPublished: true })
      });

      const data = await response.json();

      if (!data.success) {
        showNotification('Error: ' + data.error, 'error');
        return false;
      }

      setEditingContent(data.data);
      setFormData({
        title: data.data.title || defaultContactData.title,
        subtitle: data.data.subtitle || defaultContactData.subtitle,
        supportHeading: data.data.supportHeading || defaultContactData.supportHeading,
        supportEmail: data.data.supportEmail || defaultContactData.supportEmail,
        freeResources: data.data.freeResources || [],
        faqs: data.data.faqs || [],
        isPublished: data.data.isPublished ?? true
      });

      showNotification(successMessage, 'success');
      return true;
    } catch (error) {
      console.error('Error saving Contact Us content:', error);
      showNotification('Error saving Contact Us content', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveGeneralDetails = async () => {
    if (!formData.title.trim() || !formData.subtitle.trim() || !formData.supportEmail.trim()) {
      showNotification('Title, subtitle, and support email are required.', 'error');
      return;
    }

    await saveContent(formData, 'Contact details updated successfully!');
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeResourceModal = () => {
    setShowResourceModal(false);
    setActiveResourceIndex(null);
    setResourceForm({ title: '', description: '', order: 1 });
  };

  const openAddResourceModal = () => {
    setResourceModalMode('add');
    setActiveResourceIndex(null);
    setResourceForm({ title: '', description: '', order: formData.freeResources.length + 1 });
    setShowResourceModal(true);
  };

  const openEditResourceModal = (index) => {
    const item = formData.freeResources[index];
    setResourceModalMode('edit');
    setActiveResourceIndex(index);
    setResourceForm({
      title: item.title || '',
      description: item.description || '',
      order: item.order || index + 1
    });
    setShowResourceModal(true);
  };

  const openDeleteResourceModal = (index) => {
    setResourceModalMode('delete');
    setActiveResourceIndex(index);
    setShowResourceModal(true);
  };

  const handleResourceChange = (e) => {
    const { name, value } = e.target;
    setResourceForm((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 1 : value
    }));
  };

  const submitResourceModal = async () => {
    if (saving) return;

    if (resourceModalMode === 'delete') {
      const nextData = {
        ...formData,
        freeResources: formData.freeResources.filter((_, i) => i !== activeResourceIndex)
      };
      const saved = await saveContent(nextData, 'Resource deleted successfully!');
      if (saved) closeResourceModal();
      return;
    }

    if (!resourceForm.title.trim() || !resourceForm.description.trim()) {
      showNotification('Title and description are required.', 'error');
      return;
    }

    if (resourceModalMode === 'add') {
      const nextData = {
        ...formData,
        freeResources: [
          ...formData.freeResources,
          {
            title: resourceForm.title.trim(),
            description: resourceForm.description.trim(),
            order: resourceForm.order || formData.freeResources.length + 1
          }
        ]
      };
      const saved = await saveContent(nextData, 'Resource added successfully!');
      if (saved) closeResourceModal();
      return;
    }

    if (resourceModalMode === 'edit' && activeResourceIndex !== null) {
      const nextResources = [...formData.freeResources];
      nextResources[activeResourceIndex] = {
        ...nextResources[activeResourceIndex],
        title: resourceForm.title.trim(),
        description: resourceForm.description.trim(),
        order: resourceForm.order || activeResourceIndex + 1
      };
      const nextData = {
        ...formData,
        freeResources: nextResources
      };
      const saved = await saveContent(nextData, 'Resource updated successfully!');
      if (saved) closeResourceModal();
    }
  };

  const closeFaqModal = () => {
    setShowFaqModal(false);
    setActiveFaqIndex(null);
    setFaqForm({ question: '', answer: '', order: 1 });
  };

  const openAddFaqModal = () => {
    setFaqModalMode('add');
    setActiveFaqIndex(null);
    setFaqForm({ question: '', answer: '', order: formData.faqs.length + 1 });
    setShowFaqModal(true);
  };

  const openEditFaqModal = (index) => {
    const item = formData.faqs[index];
    setFaqModalMode('edit');
    setActiveFaqIndex(index);
    setFaqForm({
      question: item.question || '',
      answer: item.answer || '',
      order: item.order || index + 1
    });
    setShowFaqModal(true);
  };

  const openDeleteFaqModal = (index) => {
    setFaqModalMode('delete');
    setActiveFaqIndex(index);
    setShowFaqModal(true);
  };

  const handleFaqChange = (e) => {
    const { name, value } = e.target;
    setFaqForm((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 1 : value
    }));
  };

  const submitFaqModal = async () => {
    if (saving) return;

    if (faqModalMode === 'delete') {
      const nextData = {
        ...formData,
        faqs: formData.faqs.filter((_, i) => i !== activeFaqIndex)
      };
      const saved = await saveContent(nextData, 'FAQ deleted successfully!');
      if (saved) closeFaqModal();
      return;
    }

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showNotification('Question and answer are required.', 'error');
      return;
    }

    if (faqModalMode === 'add') {
      const nextData = {
        ...formData,
        faqs: [
          ...formData.faqs,
          {
            question: faqForm.question.trim(),
            answer: faqForm.answer.trim(),
            order: faqForm.order || formData.faqs.length + 1
          }
        ]
      };
      const saved = await saveContent(nextData, 'FAQ added successfully!');
      if (saved) closeFaqModal();
      return;
    }

    if (faqModalMode === 'edit' && activeFaqIndex !== null) {
      const nextFaqs = [...formData.faqs];
      nextFaqs[activeFaqIndex] = {
        ...nextFaqs[activeFaqIndex],
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        order: faqForm.order || activeFaqIndex + 1
      };
      const nextData = {
        ...formData,
        faqs: nextFaqs
      };
      const saved = await saveContent(nextData, 'FAQ updated successfully!');
      if (saved) closeFaqModal();
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-plab-content">
      <div className="admin-header">
        <h1>Edit "Contact Us" Section</h1>
        <button onClick={() => navigate('/admin/dashboard?section=website-admin')} className="back-button">
          ← Back to Website Admin Section
        </button>
      </div>

      <div className="content-form-container">
        <h2>Manage Contact Details</h2>
        <div className="content-form">
          <div className="form-group">
            <label>Section Title</label>
            <input name="title" value={formData.title} onChange={handleGeneralChange} />
          </div>

          <div className="form-group">
            <label>Section Subtitle</label>
            <input name="subtitle" value={formData.subtitle} onChange={handleGeneralChange} />
          </div>

          <div className="form-group">
            <label>Support Heading</label>
            <input name="supportHeading" value={formData.supportHeading} onChange={handleGeneralChange} />
          </div>

          <div className="form-group">
            <label>Support Email</label>
            <input name="supportEmail" type="email" value={formData.supportEmail} onChange={handleGeneralChange} />
          </div>

          <div className="section-modal-actions" style={{ justifyContent: 'flex-start', marginBottom: 20 }}>
            <button type="button" className="modal-save-button" onClick={saveGeneralDetails} disabled={saving}>
              {saving ? 'Saving...' : 'Save Contact Details'}
            </button>
          </div>

          <div className="sections-container">
            <div className="sections-header">
              <h3>Free Resources</h3>
              <button type="button" onClick={openAddResourceModal} className="add-section-button">+ Add Resource</button>
            </div>

            {formData.freeResources.map((item, index) => (
              <div key={index} className="section-item">
                <div className="section-header">
                  <h4>Resource {index + 1}</h4>
                  <div className="section-actions">
                    <button type="button" onClick={() => openEditResourceModal(index)} className="section-action-button update-section-button">Update</button>
                    <button type="button" onClick={() => openDeleteResourceModal(index)} className="section-action-button delete-section-button">Delete</button>
                  </div>
                </div>
                <p className="section-heading-preview">{item.title}</p>
                <div className="section-content-preview"><p>{item.description}</p></div>
                <p className="section-order-preview">Display order: {item.order || index + 1}</p>
              </div>
            ))}
          </div>

          <div className="sections-container" style={{ marginTop: 24 }}>
            <div className="sections-header">
              <h3>FAQs</h3>
              <button type="button" onClick={openAddFaqModal} className="add-section-button">+ Add FAQ</button>
            </div>

            {formData.faqs.map((item, index) => (
              <div key={index} className="section-item">
                <div className="section-header">
                  <h4>FAQ {index + 1}</h4>
                  <div className="section-actions">
                    <button type="button" onClick={() => openEditFaqModal(index)} className="section-action-button update-section-button">Update</button>
                    <button type="button" onClick={() => openDeleteFaqModal(index)} className="section-action-button delete-section-button">Delete</button>
                  </div>
                </div>
                <p className="section-heading-preview">{item.question}</p>
                <div className="section-content-preview"><p>{item.answer}</p></div>
                <p className="section-order-preview">Display order: {item.order || index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showResourceModal && (
        <div className="section-modal-overlay" onClick={closeResourceModal}>
          <div className="section-modal" onClick={(e) => e.stopPropagation()}>
            {resourceModalMode === 'delete' ? (
              <>
                <h3>Delete Resource</h3>
                <p className="section-modal-text">Are you sure you want to delete this resource?</p>
                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeResourceModal}>Cancel</button>
                  <button type="button" className="modal-delete-button" onClick={submitResourceModal} disabled={saving}>Delete</button>
                </div>
              </>
            ) : (
              <>
                <h3>{resourceModalMode === 'add' ? 'Add Resource' : 'Update Resource'}</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input name="title" value={resourceForm.title} onChange={handleResourceChange} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows={4} value={resourceForm.description} onChange={handleResourceChange} />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" min="1" name="order" value={resourceForm.order} onChange={handleResourceChange} />
                </div>
                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeResourceModal}>Cancel</button>
                  <button type="button" className="modal-save-button" onClick={submitResourceModal} disabled={saving}>{saving ? 'Saving...' : resourceModalMode === 'add' ? 'Add Resource' : 'Update Resource'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showFaqModal && (
        <div className="section-modal-overlay" onClick={closeFaqModal}>
          <div className="section-modal" onClick={(e) => e.stopPropagation()}>
            {faqModalMode === 'delete' ? (
              <>
                <h3>Delete FAQ</h3>
                <p className="section-modal-text">Are you sure you want to delete this FAQ?</p>
                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeFaqModal}>Cancel</button>
                  <button type="button" className="modal-delete-button" onClick={submitFaqModal} disabled={saving}>Delete</button>
                </div>
              </>
            ) : (
              <>
                <h3>{faqModalMode === 'add' ? 'Add FAQ' : 'Update FAQ'}</h3>
                <div className="form-group">
                  <label>Question</label>
                  <input name="question" value={faqForm.question} onChange={handleFaqChange} />
                </div>
                <div className="form-group">
                  <label>Answer</label>
                  <textarea name="answer" rows={4} value={faqForm.answer} onChange={handleFaqChange} />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" min="1" name="order" value={faqForm.order} onChange={handleFaqChange} />
                </div>
                <div className="section-modal-actions">
                  <button type="button" className="modal-cancel-button" onClick={closeFaqModal}>Cancel</button>
                  <button type="button" className="modal-save-button" onClick={submitFaqModal} disabled={saving}>{saving ? 'Saving...' : faqModalMode === 'add' ? 'Add FAQ' : 'Update FAQ'}</button>
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

export default AdminContactContent;
