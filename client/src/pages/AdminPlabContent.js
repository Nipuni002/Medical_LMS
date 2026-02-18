import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPlabContent.css';

const AdminPlabContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); // 'success' or 'error'
  const [formData, setFormData] = useState({
    pageType: 'what-is-plab',
    title: '',
    subtitle: '',
    description: '',
    sections: [],
    imageUrl: '',
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

    fetchWhatIsPlabContent();
  }, [navigate]);

  const fetchWhatIsPlabContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/plab-content/what-is-plab', {
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
          description: content.description,
          sections: content.sections || [],
          imageUrl: content.imageUrl || '',
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
      const url = `http://localhost:5000/api/plab-content/${editingContent._id}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Content updated successfully!', 'success');
        fetchWhatIsPlabContent();
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
        <h1>Edit "What is PLAB?" Content</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      {!loading && editingContent && (
        <div className="content-form-container">
          <h2>Edit Content</h2>
          <form onSubmit={handleSubmit} className="content-form">

            <div className="sections-container">
              <div className="sections-header">
                <h3>Sections</h3>
                <button type="button" onClick={addSection} className="add-section-button">
                  + Add Section
                </button>
              </div>

              {formData.sections.map((section, index) => (
                <div key={index} className="section-item">
                  <div className="section-header">
                    <h4>Section {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="remove-section-button"
                    >
                      × Remove
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Heading</label>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                      rows="3"
                      required
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
                Update Content
              </button>
            </div>
          </form>
        </div>
      )}

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

export default AdminPlabContent;
