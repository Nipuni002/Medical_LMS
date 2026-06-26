import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminTheoryContent.css';

const getStepLabel = (step) => {
  if (step === 'STEP_1') return 'STEP 1 (CAT MCQ)';
  if (step === 'STEP_2') return 'STEP 2 (Clinical OSCE)';
  return step || 'AMC';
};

function AdminAMCSubjectContent() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const [editTopicIndex, setEditTopicIndex] = useState(null);
  const [deleteTopicIndex, setDeleteTopicIndex] = useState(null);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    videoLink: ''
  });
  const [editTopic, setEditTopic] = useState({
    title: '',
    content: '',
    videoLink: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    topics: [],
    isPublished: true
  });

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean']
    ]
  }), []);

  useEffect(() => {
    checkAuth();
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const backToStepPage = () => {
    navigate('/admin/subjects-content');
  };

  const fetchInitialData = async () => {
    if (!subjectId) {
      navigate('/admin/amc-content');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/amc-subjects`);
      const subjects = await response.json();
      const subject = subjects.find((item) => item._id === subjectId);

      if (!subject) {
        showNotification('Selected subject not found', 'error');
        navigate('/admin/amc-content');
        return;
      }

      setSelectedSubject(subject);
      await fetchContentForSubject(subjectId, subject.name);
    } catch (error) {
      console.error('Error loading subject:', error);
      showNotification('Error loading subject details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchContentForSubject = async (id, subjectName = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/amc-theory-content/subject/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        setContent(result.data);
        setFormData({
          title: result.data.title || subjectName,
          topics: result.data.topics || [],
          isPublished: result.data.isPublished
        });
      } else {
        setContent(null);
        setFormData({
          title: subjectName,
          topics: [],
          isPublished: true
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(null);
      setFormData({
        title: subjectName,
        topics: [],
        isPublished: true
      });
    }
  };

  const persistContent = async (nextTopics, successMessage) => {
    if (!selectedSubject) {
      showNotification('Please select a subject', 'error');
      return false;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = content
        ? `${API_BASE_URL}/api/amc-theory-content/${content._id}`
        : `${API_BASE_URL}/api/amc-theory-content`;

      const method = content ? 'PUT' : 'POST';

      const normalizedFormData = {
        ...formData,
        title: selectedSubject.name,
        topics: nextTopics,
        isPublished: formData.isPublished ?? true
      };

      const payload = content
        ? normalizedFormData
        : { ...normalizedFormData, subjectId: selectedSubject._id };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        const updatedTopics = result.data?.topics || nextTopics;
        setContent(result.data);
        setFormData((prev) => ({
          ...prev,
          title: result.data?.title || normalizedFormData.title,
          topics: updatedTopics,
          isPublished: result.data?.isPublished ?? normalizedFormData.isPublished
        }));
        if (successMessage) {
          showNotification(successMessage, 'success');
        }
        return true;
      }

      showNotification(result.message || 'Error saving content', 'error');
      return false;
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Error saving content', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addTopic = () => {
    setShowAddTopicModal(true);
    setNewTopic({
      title: '',
      content: '',
      videoLink: ''
    });
  };

  const handleAddTopicConfirm = async () => {
    if (!newTopic.title.trim()) {
      showNotification('Topic title is required', 'error');
      return;
    }
    if (!newTopic.content.trim()) {
      showNotification('Topic content is required', 'error');
      return;
    }

    const newTopics = [
      ...formData.topics,
      {
        title: newTopic.title,
        content: newTopic.content,
        videoLink: newTopic.videoLink,
        order: formData.topics.length
      }
    ];

    const saved = await persistContent(newTopics, 'Topic added successfully!');
    if (!saved) return;

    setShowAddTopicModal(false);
    setNewTopic({ title: '', content: '', videoLink: '' });
  };

  const handleAddTopicCancel = () => {
    setShowAddTopicModal(false);
    setNewTopic({ title: '', content: '', videoLink: '' });
  };

  const openEditTopicModal = (index) => {
    const topic = formData.topics[index];
    if (!topic) return;

    setEditTopicIndex(index);
    setEditTopic({
      title: topic.title || '',
      content: topic.content || '',
      videoLink: topic.videoLink || ''
    });
    setShowEditTopicModal(true);
  };

  const handleEditTopicCancel = () => {
    setShowEditTopicModal(false);
    setEditTopicIndex(null);
    setEditTopic({ title: '', content: '', videoLink: '' });
  };

  const handleEditTopicConfirm = async () => {
    if (!editTopic.title.trim()) {
      showNotification('Topic title is required', 'error');
      return;
    }
    if (!editTopic.content.trim()) {
      showNotification('Topic content is required', 'error');
      return;
    }
    if (editTopicIndex === null || !formData.topics[editTopicIndex]) {
      showNotification('Topic not found', 'error');
      return;
    }

    const newTopics = [...formData.topics];
    const existingTopic = newTopics[editTopicIndex];
    newTopics[editTopicIndex] = {
      ...existingTopic,
      title: editTopic.title,
      content: editTopic.content,
      videoLink: editTopic.videoLink
    };

    const saved = await persistContent(newTopics, 'Topic updated successfully!');
    if (!saved) return;

    setShowEditTopicModal(false);
    setEditTopicIndex(null);
    setEditTopic({ title: '', content: '', videoLink: '' });
  };

  const openDeleteTopicModal = (index) => {
    setDeleteTopicIndex(index);
    setShowDeleteTopicModal(true);
  };

  const handleDeleteTopicCancel = () => {
    setShowDeleteTopicModal(false);
    setDeleteTopicIndex(null);
  };

  const removeTopic = async (index) => {
    const newTopics = formData.topics
      .filter((_, i) => i !== index)
      .map((topic, i) => ({ ...topic, order: i }));

    return persistContent(newTopics, 'Topic deleted successfully!');
  };

  const handleDeleteTopicConfirm = async () => {
    if (deleteTopicIndex === null) return;

    const saved = await removeTopic(deleteTopicIndex);
    if (!saved) return;

    setShowDeleteTopicModal(false);
    setDeleteTopicIndex(null);
  };

  const moveTopicUp = async (index) => {
    if (index === 0) return;
    const newTopics = [...formData.topics];
    [newTopics[index], newTopics[index - 1]] = [newTopics[index - 1], newTopics[index]];
    newTopics.forEach((topic, i) => {
      topic.order = i;
    });
    await persistContent(newTopics, 'Topic order updated successfully!');
  };

  const moveTopicDown = async (index) => {
    if (index === formData.topics.length - 1) return;
    const newTopics = [...formData.topics];
    [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
    newTopics.forEach((topic, i) => {
      topic.order = i;
    });
    await persistContent(newTopics, 'Topic order updated successfully!');
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!selectedSubject) {
    return (
      <div className="admin-theory-content">
        <div className="admin-header">
          <h1>Manage AMC Subject Content</h1>
          <button onClick={backToStepPage} className="back-button">
            ← Back to Subjects
          </button>
        </div>
        <div className="content-form-container">
          <p className="no-topics">Subject not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theory-content">
      <div className="admin-header">
        <h1>Manage AMC Subject Content</h1>
        <button onClick={backToStepPage} className="back-button">
          ← Back to Subjects
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="content-form-container">
        <div className="subject-selector">
          <div className="admin-subject-bank-header">
            <h2>{selectedSubject.name}</h2>
            <p>{getStepLabel(selectedSubject.step)} | Add or update this subject content below.</p>
          </div>
        </div>

        <div className="theory-content-form">
          <div className="form-section topics-section">
            <div className="section-header">
              <h2>Topics</h2>
              <button type="button" onClick={addTopic} className="add-topic-btn" disabled={saving}>
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
                          disabled={index === 0 || saving}
                          className="move-btn"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTopicDown(index)}
                          disabled={index === formData.topics.length - 1 || saving}
                          className="move-btn"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditTopicModal(index)}
                          className="update-btn"
                          title="Update topic"
                          disabled={saving}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteTopicModal(index)}
                          className="remove-btn"
                          title="Delete topic"
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="topic-summary">
                      <p><strong>Title:</strong> {topic.title || 'Untitled topic'}</p>
                      <p><strong>Video:</strong> {topic.videoLink || 'No video link'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddTopicModal && (
        <div className="modal-overlay" onClick={handleAddTopicCancel}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Topic</h2>
              <button className="modal-close" onClick={handleAddTopicCancel}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Topic Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Clinical Examination"
                  className="topic-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Content <span className="required">*</span></label>
                <ReactQuill
                  theme="snow"
                  value={newTopic.content}
                  onChange={(value) => setNewTopic((prev) => (
                    prev.content === value ? prev : { ...prev, content: value }
                  ))}
                  placeholder="Detailed content for this topic..."
                  modules={quillModules}
                  className="quill-editor"
                />
                <input type="hidden" required value={newTopic.content ? 'has-content' : ''} />
              </div>

              <div className="form-group">
                <label>Video Link (Optional)</label>
                <input
                  type="url"
                  value={newTopic.videoLink}
                  onChange={(e) => setNewTopic((prev) => ({ ...prev, videoLink: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="topic-input"
                />
                <small className="help-text">Enter YouTube, Vimeo, or other video platform URL</small>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleAddTopicCancel} className="cancel-btn">Cancel</button>
              <button onClick={handleAddTopicConfirm} className="confirm-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditTopicModal && (
        <div className="modal-overlay" onClick={handleEditTopicCancel}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Topic</h2>
              <button className="modal-close" onClick={handleEditTopicCancel}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Topic Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={editTopic.title}
                  onChange={(e) => setEditTopic((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Clinical Examination"
                  className="topic-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Content <span className="required">*</span></label>
                <ReactQuill
                  theme="snow"
                  value={editTopic.content}
                  onChange={(value) => setEditTopic((prev) => (
                    prev.content === value ? prev : { ...prev, content: value }
                  ))}
                  placeholder="Detailed content for this topic..."
                  modules={quillModules}
                  className="quill-editor"
                />
                <input type="hidden" required value={editTopic.content ? 'has-content' : ''} />
              </div>

              <div className="form-group">
                <label>Video Link (Optional)</label>
                <input
                  type="url"
                  value={editTopic.videoLink}
                  onChange={(e) => setEditTopic((prev) => ({ ...prev, videoLink: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="topic-input"
                />
                <small className="help-text">Enter YouTube, Vimeo, or other video platform URL</small>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleEditTopicCancel} className="cancel-btn">Cancel</button>
              <button onClick={handleEditTopicConfirm} className="confirm-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Update Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteTopicModal && (
        <div className="modal-overlay" onClick={handleDeleteTopicCancel}>
          <div className="modal-dialog delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Topic</h2>
              <button className="modal-close" onClick={handleDeleteTopicCancel}>×</button>
            </div>

            <div className="modal-body">
              <p className="delete-warning-text">
                Are you sure you want to delete Topic {deleteTopicIndex !== null ? deleteTopicIndex + 1 : ''}?
              </p>
              <p className="delete-warning-subtext">This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button onClick={handleDeleteTopicCancel} className="cancel-btn">Cancel</button>
              <button onClick={handleDeleteTopicConfirm} className="delete-confirm-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Delete Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAMCSubjectContent;
