import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeStudents: 0,
    instructors: 0
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/admin/login';
    }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const users = data.data;
        setStats({
          totalUsers: users.length,
          totalCourses: 0,
          activeStudents: users.filter(u => u.role === 'student').length,
          instructors: users.filter(u => u.role === 'instructor').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'theory-subjects', label: 'Manage Theory Subjects', icon: '📚' },
    { id: 'theory-content', label: 'Manage Theory Content', icon: '📖' },
    { id: 'what-is-plab', label: 'What is PLAB', icon: '📝' },
    { id: 'plab1-tips', label: 'PLAB 1 Tips', icon: '💡' },
    { id: 'manage-plab', label: 'Manage PLAB', icon: '🎓' }
  ];

  const handleNavigation = (sectionId) => {
    if (sectionId === 'theory-subjects') {
      window.location.href = '/admin/theory-subjects';
    } else if (sectionId === 'theory-content') {
      window.location.href = '/admin/theory-content';
    } else if (sectionId === 'what-is-plab') {
      window.location.href = '/admin/plab-content';
    } else if (sectionId === 'plab1-tips') {
      window.location.href = '/admin/plab1-tips';
    } else {
      setActiveSection(sectionId);
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Medical LMS</h2>
          <p className="admin-badge">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1>Welcome back, {user.name}!</h1>
          <p className="subtitle">Manage your medical learning management system</p>
        </header>

        {activeSection === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <span>👥</span>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <span>📚</span>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalCourses}</h3>
                  <p>Total Courses</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <span>🎓</span>
                </div>
                <div className="stat-content">
                  <h3>{stats.activeStudents}</h3>
                  <p>Active Students</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <span>👨‍🏫</span>
                </div>
                <div className="stat-content">
                  <h3>{stats.instructors}</h3>
                  <p>Instructors</p>
                </div>
              </div>
            </div>

            <div className="quick-access">
              <h2>Quick Access</h2>
              <div className="quick-access-grid">
                <div className="access-card" onClick={() => handleNavigation('theory-subjects')}>
                  <div className="access-icon">📚</div>
                  <h3>Theory Subjects</h3>
                  <p>Manage course content</p>
                </div>
                <div className="access-card" onClick={() => handleNavigation('what-is-plab')}>
                  <div className="access-icon">📝</div>
                  <h3>What is PLAB</h3>
                  <p>Edit PLAB information</p>
                </div>
                <div className="access-card" onClick={() => handleNavigation('plab1-tips')}>
                  <div className="access-icon">💡</div>
                  <h3>PLAB 1 Tips</h3>
                  <p>Manage exam tips</p>
                </div>
                <div className="access-card" onClick={() => handleNavigation('manage-plab')}>
                  <div className="access-icon">🎓</div>
                  <h3>Manage PLAB</h3>
                  <p>PLAB management hub</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'manage-plab' && (
          <div className="manage-plab-section">
            <h2>Manage PLAB</h2>
            <div className="plab-management-grid">
              <div className="management-card" onClick={() => handleNavigation('what-is-plab')}>
                <div className="card-header">
                  <span className="card-icon">📝</span>
                  <h3>PLAB Content</h3>
                </div>
                <p>Edit "What is PLAB" section content</p>
                <button className="card-action">Manage →</button>
              </div>
              <div className="management-card" onClick={() => handleNavigation('plab1-tips')}>
                <div className="card-header">
                  <span className="card-icon">💡</span>
                  <h3>PLAB 1 Tips</h3>
                </div>
                <p>Manage tips and guidance for PLAB 1 exam</p>
                <button className="card-action">Manage →</button>
              </div>
              <div className="management-card" onClick={() => handleNavigation('theory-subjects')}>
                <div className="card-header">
                  <span className="card-icon">📚</span>
                  <h3>Theory Subjects</h3>
                </div>
                <p>Manage PLAB theory subjects and topics</p>
              <div className="management-card" onClick={() => handleNavigation('theory-content')}>
                <div className="card-header">
                  <span className="card-icon">📖</span>
                  <h3>Theory Content</h3>
                </div>
                <p>Add detailed content and videos for subjects</p>
                <button className="card-action">Manage →</button>
              </div>
                <button className="card-action">Manage →</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
