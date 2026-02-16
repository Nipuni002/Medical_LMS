import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPlabContent.css';

const AdminPlab1Tips = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [formData, setFormData] = useState({
    pageType: 'plab1-tips',
    title: '',
    subtitle: '',
    sections: [],
    isPublished: true
  });

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

    fetchPlab1TipsContent();
  }, [navigate]);

  const fetchPlab1TipsContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/plab-content/plab1-tips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const content = data.data;
        setEditingContent(content);
        setFormData({
          pageType: content.pageType,
          title: content.title,
          subtitle: content.subtitle || '',
          sections: content.sections || [],
          isPublished: content.isPublished
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { heading: '', content: '', order: prev.sections.length + 1 }]
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      let url, method;
      
      if (editingContent) {
        url = `http://localhost:5000/api/plab-content/${editingContent._id}`;
        method = 'PUT';
      } else {
        url = 'http://localhost:5000/api/plab-content';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification(editingContent ? 'Content updated successfully!' : 'Content created successfully!', 'success');
        fetchPlab1TipsContent();
      } else {
        showNotification('Error: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Error saving content', 'error');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-plab-content">
      <div className="admin-header">
        <h1>Edit PLAB 1 Tips Content</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      <div className="content-form-container">
        <h2>{editingContent ? 'Edit Content' : 'Create New Content'}</h2>
        <form onSubmit={handleSubmit} className="content-form">
          <div className="form-group">
            <label>Page Type *</label>
            <select
              name="pageType"
              value={formData.pageType}
              onChange={handleInputChange}
              required
              disabled
            >
              <option value="plab1-tips">PLAB 1 Tips</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., PLAB 1 TIPS"
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              placeholder="e.g., (Principles to follow throughout preparation & the exam)"
            />
          </div>

          <div className="sections-container">
            <div className="sections-header">
              <h3>Tips Sections</h3>
              <button type="button" onClick={addSection} className="add-section-button">
                + Add Tip Section
              </button>
            </div>

            {formData.sections.map((section, index) => (
              <div key={index} className="section-item">
                <div className="section-header">
                  <h4>Tip {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="remove-section-button"
                  >
                    × Remove
                  </button>
                </div>

                <div className="form-group">
                  <label>Heading *</label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                    required
                    placeholder="e.g., 1. Think Like a UK Doctor"
                  />
                </div>

                <div className="form-group">
                  <label>Content * (Use • or - for bullet points, one per line)</label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                    rows="6"
                    required
                    placeholder="Enter tip description or bullet points&#10;• Follow NICE / GMC logic, not home-country practice&#10;• Conservative, safe, patient-centred answers score best"
                  />
                </div>

                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={section.order}
                    onChange={(e) => handleSectionChange(index, 'order', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
              />
              Published
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              {editingContent ? 'Update Content' : 'Create Content'}
            </button>
          </div>
        </form>
      </div>

      {/* Popup Notification */}
      {showPopup && (
        <div className={`popup-notification ${popupType}`}>
          <div className="popup-content">
            <span className="popup-icon">
              {popupType === 'success' ? '✓' : '✕'}
            </span>
            <p className="popup-message">{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlab1Tips;
