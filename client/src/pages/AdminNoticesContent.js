import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import './AdminNoticesContent.css';

const AdminNoticesContent = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'special',
    isImportant: false
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
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

    fetchNotices();
  }, [navigate]);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotices(data.data);
      } else {
        showNotification(data.error || 'Failed to load notices', 'error');
      }
    } catch (error) {
      showNotification('Error loading notices', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddClick = () => {
    setEditingNoticeId(null);
    setFormData({
      title: '',
      content: '',
      category: 'special',
      isImportant: false
    });
    setShowModal(true);
  };

  const handleEditClick = (notice) => {
    setEditingNoticeId(notice._id);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category || 'special',
      isImportant: notice.isImportant || false
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/notices/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Notice deleted successfully');
        setNotices(notices.filter((n) => n._id !== deleteId));
      } else {
        showNotification(data.error || 'Failed to delete notice', 'error');
      }
    } catch (error) {
      showNotification('Server error deleting notice', 'error');
    } finally {
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('Please add a title and content', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingNoticeId 
        ? `${API_BASE_URL}/api/notices/${editingNoticeId}` 
        : `${API_BASE_URL}/api/notices`;
      const method = editingNoticeId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification(editingNoticeId ? 'Notice updated successfully' : 'Notice created successfully');
        setShowModal(false);
        fetchNotices();
      } else {
        showNotification(data.error || 'Failed to save notice', 'error');
      }
    } catch (error) {
      showNotification('Server error saving notice', 'error');
    }
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-notices-container">
      <div className="admin-notices-header-bar">
        <div className="title-section">
          <h1>Special Notices & News</h1>
          <p>Create and update notices broadcasted to registered users.</p>
        </div>
        <div className="action-section">
          <button onClick={() => navigate('/admin/dashboard?section=website-admin')} className="btn-back">
            ← Back to Dashboard
          </button>
          <button onClick={handleAddClick} className="btn-add">
            + Create New Notice
          </button>
        </div>
      </div>

      {notification && (
        <div className={`admin-notices-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-notices-search-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-notices-loading">
          <div className="spinner"></div>
          <p>Loading notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="admin-notices-empty">
          <span className="empty-icon">📢</span>
          <h3>No notices found</h3>
          <p>Click "Create New Notice" to add your first post.</p>
        </div>
      ) : (
        <div className="admin-notices-grid">
          {filteredNotices.map((notice) => (
            <div key={notice._id} className={`notice-admin-card ${notice.isImportant ? 'important' : ''}`}>
              <div className="notice-admin-card-header">
                <span className={`notice-badge ${notice.category}`}>
                  {notice.category}
                </span>
                {notice.isImportant && <span className="notice-badge-important">🔥 Important</span>}
                <div className="card-actions">
                  <button onClick={() => handleEditClick(notice)} className="edit-btn" title="Edit">✏️</button>
                  <button onClick={() => handleDeleteClick(notice._id)} className="delete-btn" title="Delete">🗑️</button>
                </div>
              </div>
              <h3 className="notice-admin-title">{notice.title}</h3>
              <p className="notice-admin-excerpt">{notice.content}</p>
              <div className="notice-admin-footer">
                <span>By: {notice.createdBy?.name || 'Admin'}</span>
                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="notice-modal-backdrop">
          <div className="notice-modal-content">
            <h2>{editingNoticeId ? 'Edit Notice' : 'Create New Notice'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Notice Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notice title..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="special">Special</option>
                    <option value="general">General</option>
                    <option value="news">News</option>
                  </select>
                </div>
                <div className="form-group half checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isImportant"
                      checked={formData.isImportant}
                      onChange={handleInputChange}
                    />
                    Mark as Important
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Content Description</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write notice details here..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingNoticeId ? 'Save Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="notice-modal-backdrop">
          <div className="confirm-modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this notice? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmDialog(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticesContent;
