import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import './AdminUsersManagement.css';

const AdminUsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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

    setCurrentUser(userData);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        showNotification(data.error || 'Failed to load users', 'error');
      }
    } catch (error) {
      showNotification('Error loading users', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userToDelete) => {
    if (currentUser && currentUser.id === userToDelete._id) {
      showNotification('You cannot delete your own admin account!', 'error');
      return;
    }
    setDeleteId(userToDelete._id);
    setDeleteName(userToDelete.name);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        showNotification('User deleted successfully');
        setUsers(users.filter((u) => u._id !== deleteId));
      } else {
        showNotification(data.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      showNotification('Server error deleting user', 'error');
    } finally {
      setShowConfirmDialog(false);
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-users-container">
      <div className="admin-users-header-bar">
        <div className="title-section">
          <h1>User Management</h1>
          <p>Monitor, search, and delete registered user and student accounts.</p>
        </div>
        <div className="action-section">
          <button onClick={() => navigate('/admin/dashboard?section=overview')} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {notification && (
        <div className={`admin-users-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-users-search-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-users-loading">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-users-empty">
          <span className="empty-icon">👥</span>
          <h3>No users found</h3>
          <p>We couldn't find any registered users matching your search.</p>
        </div>
      ) : (
        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className={currentUser && currentUser.id === u._id ? 'self-row' : ''}>
                  <td className="user-name-cell">
                    <div className="user-avatar-small">{u.name.charAt(0).toUpperCase()}</div>
                    <span>{u.name} {currentUser && currentUser.id === u._id && <strong className="self-label">(You)</strong>}</span>
                  </td>
                  <td className="user-email-cell">{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role || 'student'}`}>
                      {u.role || 'student'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt || Date.now()).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</td>
                  <td>
                    {currentUser && currentUser.id === u._id ? (
                      <span className="action-disabled-text">System Active</span>
                    ) : (
                      <button onClick={() => handleDeleteClick(u)} className="btn-table-delete">
                        Delete Account
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="users-modal-backdrop">
          <div className="confirm-modal-content">
            <h3>Confirm User Deletion</h3>
            <p>Are you sure you want to permanently delete <strong>{deleteName}</strong>'s account? All course progress and data will be lost. This cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmDialog(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;
