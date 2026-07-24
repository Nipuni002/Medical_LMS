import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SpecialNotices.css';

const SpecialNotices = () => {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth Form State
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
      fetchNotices();
    } else {
      setLoading(false);
    }
  }, []);

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
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthInputChange = (e) => {
    setAuthFormData({
      ...authFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Validate email format on frontend
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!authFormData.email || !emailRegex.test(authFormData.email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (!isLoginTab && authFormData.password !== authFormData.confirmPassword) {
      setAuthError('Passwords do not match. Please check and try again.');
      return;
    }

    setAuthLoading(true);

    const url = isLoginTab 
      ? `${API_BASE_URL}/api/auth/login` 
      : `${API_BASE_URL}/api/auth/register`;

    const body = isLoginTab 
      ? { email: authFormData.email, password: authFormData.password }
      : { name: authFormData.name, email: authFormData.email, password: authFormData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Fetch notices after logging in
        setLoading(true);
        const noticesResponse = await fetch(`${API_BASE_URL}/api/notices`, {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        const noticesData = await noticesResponse.json();
        if (noticesData.success) {
          setNotices(noticesData.data);
        }
        setLoading(false);
      } else {
        setAuthError(data.error || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      setAuthError('Server connection error. Please try again later.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordInputChange = (e) => {
    setForgotPasswordForm({
      ...forgotPasswordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setForgotPasswordSuccess('');

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!forgotPasswordForm.email || !emailRegex.test(forgotPasswordForm.email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (forgotPasswordForm.password !== forgotPasswordForm.confirmPassword) {
      setAuthError('Passwords do not match. Please check and try again.');
      return;
    }

    if (forgotPasswordForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: forgotPasswordForm.email,
          password: forgotPasswordForm.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setForgotPasswordSuccess(data.message || 'Password reset successfully!');
        setForgotPasswordForm({ email: '', password: '', confirmPassword: '' });
      } else {
        setAuthError(data.error || 'Failed to reset password.');
      }
    } catch (error) {
      setAuthError('Server connection error. Please try again later.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotices([]);
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="special-notices-page">
      <Header />

      <main className="special-notices-main">
        {!user ? (
          /* Authentication Screen */
          <div className="auth-box-container">
            <div className="auth-card">
              <div className="auth-header">
                <h2>Special Notices Portal</h2>
                <p>Register or log in to view special notice boards and emergency news.</p>
              </div>

              {isForgotPassword ? (
                /* Forgot Password Screen */
                <>
                  <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email and set a new password for your account.</p>
                  </div>

                  <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                    {authError && (
                      <div className="auth-error">
                        <span>⚠️</span> {authError}
                      </div>
                    )}
                    {forgotPasswordSuccess && (
                      <div className="auth-success" style={{
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid #a7f3d0'
                      }}>
                        <span>✓</span> {forgotPasswordSuccess}
                      </div>
                    )}

                    <div className="auth-input-group">
                      <label htmlFor="forgotEmail">Email Address</label>
                      <input
                        type="email"
                        id="forgotEmail"
                        name="email"
                        value={forgotPasswordForm.email}
                        onChange={handleForgotPasswordInputChange}
                        placeholder="Enter your email address"
                        required
                        disabled={authLoading}
                      />
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="forgotPassword">New Password</label>
                      <input
                        type="password"
                        id="forgotPassword"
                        name="password"
                        value={forgotPasswordForm.password}
                        onChange={handleForgotPasswordInputChange}
                        placeholder="Enter new password (min. 6 characters)"
                        minLength="6"
                        required
                        disabled={authLoading}
                      />
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="forgotConfirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="forgotConfirmPassword"
                        name="confirmPassword"
                        value={forgotPasswordForm.confirmPassword}
                        onChange={handleForgotPasswordInputChange}
                        placeholder="Re-enter new password"
                        minLength="6"
                        required
                        disabled={authLoading}
                      />
                    </div>

                    <button type="submit" disabled={authLoading} className="auth-submit-btn">
                      {authLoading ? 'Please wait...' : 'Reset Password'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0A2463',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={() => {
                          setIsForgotPassword(false);
                          setAuthError('');
                          setForgotPasswordSuccess('');
                          setForgotPasswordForm({ email: '', password: '', confirmPassword: '' });
                        }}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Regular Sign In / Sign Up Screen */
                <>
                  <div className="auth-tabs">
                    <button 
                      className={`tab-btn ${isLoginTab ? 'active' : ''}`}
                      onClick={() => {
                        setIsLoginTab(true);
                        setAuthError('');
                        setAuthFormData({ name: '', email: '', password: '', confirmPassword: '' });
                      }}
                    >
                      Sign In
                    </button>
                    <button 
                      className={`tab-btn ${!isLoginTab ? 'active' : ''}`}
                      onClick={() => {
                        setIsLoginTab(false);
                        setAuthError('');
                        setAuthFormData({ name: '', email: '', password: '', confirmPassword: '' });
                      }}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="auth-form">
                    {authError && (
                      <div className="auth-error">
                        <span>⚠️</span> {authError}
                      </div>
                    )}

                    {!isLoginTab && (
                      <div className="auth-input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={authFormData.name}
                          onChange={handleAuthInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    )}

                    <div className="auth-input-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={authFormData.email}
                        onChange={handleAuthInputChange}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div className="auth-input-group">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={authFormData.password}
                        onChange={handleAuthInputChange}
                        placeholder="Enter your password (min. 6 characters)"
                        minLength="6"
                        required
                      />
                    </div>

                    {!isLoginTab && (
                      <div className="auth-input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={authFormData.confirmPassword}
                          onChange={handleAuthInputChange}
                          placeholder="Re-enter your password"
                          minLength="6"
                          required
                        />
                      </div>
                    )}

                    {isLoginTab && (
                      <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setIsForgotPassword(true);
                            setAuthError('');
                            setForgotPasswordSuccess('');
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#0A2463'}
                          onMouseLeave={(e) => e.target.style.color = '#64748b'}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button type="submit" disabled={authLoading} className="auth-submit-btn">
                      {authLoading ? 'Please wait...' : isLoginTab ? 'Login to Portal' : 'Register Account'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Logged In Feed Screen */
          <div className="notices-feed-container">
            <div className="feed-header-panel">
              <div className="welcome-info">
                <h1>Special Notices Board</h1>
                <p>Welcome, <strong>{user.name}</strong>! Below are the latest announcements and medical news.</p>
              </div>
              <button onClick={handleLogout} className="feed-logout-btn">
                Log Out
              </button>
            </div>

            <div className="feed-search-row">
              <div className="feed-search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Filter announcements by keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="feed-loading">
                <div className="spinner"></div>
                <p>Loading special announcements...</p>
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="feed-empty-state">
                <span className="empty-icon">📢</span>
                <h3>No announcements yet</h3>
                <p>Stay tuned! Our medical educators will post updates here soon.</p>
              </div>
            ) : (
              <div className="feed-list">
                {filteredNotices.map((notice) => (
                  <article key={notice._id} className={`feed-card ${notice.isImportant ? 'important' : ''}`}>
                    {notice.isImportant && (
                      <div className="priority-banner">
                        <span>🔥 IMPORTANT ANNOUNCEMENT</span>
                      </div>
                    )}
                    
                    <div className="feed-card-header">
                      <h2 className="feed-title">{notice.title}</h2>
                      <span className={`feed-category-badge ${notice.category}`}>
                        {notice.category}
                      </span>
                    </div>

                    <div className="feed-card-meta">
                      <span className="meta-author">Posted by: {notice.createdBy?.name || 'Administrator'}</span>
                      <span className="meta-dot">•</span>
                      <span className="meta-date">Date: {new Date(notice.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>

                    <div className="feed-card-content">
                      <p>{notice.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SpecialNotices;
