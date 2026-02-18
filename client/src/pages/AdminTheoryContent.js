import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTheoryContent.css';

function AdminTheoryContent() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topics: [],
    isPublished: true
  });

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
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setLoading(false);
      showNotification('Error fetching subjects', 'error');
    }
  };

  const fetchContentForSubject = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/plab-theory-content/subject/${subjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setContent(result.data);
        setFormData({
          title: result.data.title,
          topics: result.data.topics || [],
          isPublished: result.data.isPublished
        });
      } else {
        // No content exists yet, initialize empty form
        setContent(null);
        setFormData({
          title: '',
          topics: [],
          isPublished: true
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Initialize empty form on error
      setContent(null);
      setFormData({
        title: '',
        topics: [],
        isPublished: true
      });
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const subject = subjects.find(s => s._id === subjectId);
    setSelectedSubject(subject);
    if (subjectId) {
      fetchContentForSubject(subjectId);
    } else {
      setSelectedSubject(null);
      setContent(null);
      setFormData({
        title: '',
        description: '',
        topics: [],
        isPublished: true
      });
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTopicChange = (index, field, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = { ...newTopics[index], [field]: value };
    setFormData(prev => ({ ...prev, topics: newTopics }));
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [
        ...prev.topics,
        { title: '', content: '', videoLink: '', order: prev.topics.length }
      ]
    }));
  };

  const removeTopic = (index) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const moveTopicUp = (index) => {
    if (index === 0) return;
    const newTopics = [...formData.topics];
    [newTopics[index], newTopics[index - 1]] = [newTopics[index - 1], newTopics[index]];
    newTopics.forEach((topic, i) => {
      topic.order = i;
    });
    setFormData(prev => ({ ...prev, topics: newTopics }));
  };

  const moveTopicDown = (index) => {
    if (index === formData.topics.length - 1) return;
    const newTopics = [...formData.topics];
    [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
    newTopics.forEach((topic, i) => {
      topic.order = i;
    });
    setFormData(prev => ({ ...prev, topics: newTopics }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      showNotification('Please select a subject', 'error');
      return;
    }

    if (!formData.title.trim()) {
      showNotification('Title is required', 'error');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = content
        ? `http://localhost:5000/api/plab-theory-content/${content._id}`
        : 'http://localhost:5000/api/plab-theory-content';
      
      const method = content ? 'PUT' : 'POST';
      
      const payload = content
        ? formData
        : { ...formData, subjectId: selectedSubject._id };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        showNotification(
          content ? 'Content updated successfully!' : 'Content created successfully!',
          'success'
        );
        setContent(result.data);
      } else {
        showNotification(result.message || 'Error saving content', 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Error saving content', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-theory-content">
      <div className="admin-header">
        <h1>Manage Theory Subject Content</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="content-form-container">
        <div className="subject-selector">
          <label>Select Subject:</label>
          <select 
            value={selectedSubject?._id || ''} 
            onChange={handleSubjectChange}
            className="subject-select"
          >
            <option value="">-- Select a Subject --</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.weightage})
              </option>
            ))}
          </select>
        </div>

        {selectedSubject && (
          <form onSubmit={handleSubmit} className="theory-content-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-group">
                <label htmlFor="title">
                  Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Ethics, Law & Communication"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                  />
                  <span>Published (visible to students)</span>
                </label>
              </div>
            </div>

            <div className="form-section topics-section">
              <div className="section-header">
                <h2>Topics</h2>
                <button type="button" onClick={addTopic} className="add-topic-btn">
                  + Add Topic
                </button>
              </div>

              {formData.topics.length === 0 ? (
                <p className="no-topics">No topics added yet. Click "Add Topic" to start.</p>
              ) : (
                <div className="topics-list">
                  {formData.topics.map((topic, index) => (
                    <div key={index} className="topic-card">
                      <div className="topic-header">
                        <h3>Topic {index + 1}</h3>
                        <div className="topic-actions">
                          <button
                            type="button"
                            onClick={() => moveTopicUp(index)}
                            disabled={index === 0}
                            className="move-btn"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTopicDown(index)}
                            disabled={index === formData.topics.length - 1}
                            className="move-btn"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTopic(index)}
                            className="remove-btn"
                            title="Remove topic"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Topic Title <span className="required">*</span></label>
                        <input
                          type="text"
                          value={topic.title}
                          onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                          placeholder="e.g., Consent and Capacity"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Content <span className="required">*</span></label>
                        <textarea
                          value={topic.content}
                          onChange={(e) => handleTopicChange(index, 'content', e.target.value)}
                          placeholder="Detailed content for this topic..."
                          rows="6"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Video Link (Optional)</label>
                        <input
                          type="url"
                          value={topic.videoLink}
                          onChange={(e) => handleTopicChange(index, 'videoLink', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <small className="help-text">
                          Enter YouTube, Vimeo, or other video platform URL
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : content ? 'Update Content' : 'Create Content'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminTheoryContent;
