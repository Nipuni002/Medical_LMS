import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/admin/login';
    }

    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section');
    if (sectionParam === 'plab-admin' || sectionParam === 'usmle-admin' || sectionParam === 'amc-admin' || sectionParam === 'website-admin' || sectionParam === 'subjects-content-admin' || sectionParam === 'overview') {
      setActiveSection(sectionParam);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  const menuItems = [
    { id: 'overview', label: 'Course Dashboard', icon: '🏠' },
    { id: 'plab-admin', label: 'PLAB Admin Section', icon: '🎯' },
    { id: 'usmle-admin', label: 'USMLE Admin Section', icon: '🩺' },
    { id: 'amc-admin', label: 'AMC Admin Section', icon: '🇦🇺' },
    { id: 'subjects-content-admin', label: 'Subjects & Content (All)', icon: '🧩' },
    { id: 'website-admin', label: 'Website Admin Section', icon: '🌐' }
  ];

  const handleNavigation = (sectionId) => {
    if (sectionId === 'theory-subjects') {
      window.location.href = '/admin/theory-subjects';
    } else if (sectionId === 'theory-content') {
      window.location.href = '/admin/subjects-content?category=plab';
    } else if (sectionId === 'what-is-plab') {
      window.location.href = '/admin/plab-content';
    } else if (sectionId === 'plab1-tips') {
      window.location.href = '/admin/plab1-tips';
    } else if (sectionId === 'plab2-guide') {
      window.location.href = '/admin/plab2-guide';
    } else if (sectionId === 'plab2-pretest') {
      window.location.href = '/admin/plab2-pretest';
    } else if (sectionId === 'plab1-tests') {
      window.location.href = '/admin/plab1-tests';
    } else if (sectionId === 'usmle-subjects') {
      window.location.href = '/admin/usmle-subjects';
    } else if (sectionId === 'usmle-content') {
      window.location.href = '/admin/usmle-content';
    } else if (sectionId === 'usmle-introduction') {
      window.location.href = '/admin/usmle-content/introduction';
    } else if (sectionId === 'usmle-step1-pretest') {
      window.location.href = '/admin/usmle-step1-pretest';
    } else if (sectionId === 'usmle-step2-pretest') {
      window.location.href = '/admin/usmle-step2-pretest';
    } else if (sectionId === 'usmle-step3-pretest') {
      window.location.href = '/admin/usmle-step3-pretest';
    } else if (sectionId === 'amc-subjects') {
      window.location.href = '/admin/amc-subjects';
    } else if (sectionId === 'amc-content') {
      window.location.href = '/admin/amc-content';
    } else if (sectionId === 'amc-step1-pretest') {
      window.location.href = '/admin/amc-step1-pretest';
    } else if (sectionId === 'amc-step2-pretest') {
      window.location.href = '/admin/amc-step2-pretest';
    } else if (sectionId === 'all-subjects-content') {
      window.location.href = '/admin/subjects-content';
    } else if (sectionId === 'all-subjects-content-plab') {
      window.location.href = '/admin/subjects-content?category=plab';
    } else if (sectionId === 'all-subjects-content-usmle') {
      window.location.href = '/admin/subjects-content?category=usmle';
    } else if (sectionId === 'all-subjects-content-amc') {
      window.location.href = '/admin/subjects-content?category=amc';
    } else if (sectionId === 'about-content') {
      window.location.href = '/admin/about-content';
    } else if (sectionId === 'contact-content') {
      window.location.href = '/admin/contact-content';
    } else {
      setActiveSection(sectionId);
    }
  };

  const courseSections = [
    {
      id: 'plab',
      title: 'PLAB',
      icon: '🎓',
      description: 'PLAB learning path and core exam preparation content.',
      route: '/exams/plab',
      accent: 'course-plab'
    },
    {
      id: 'usmle',
      title: 'USMLE',
      icon: '🩺',
      description: 'USMLE sections, topics, and navigation for Step preparation.',
      route: '/exams/usmle',
      accent: 'course-usmle'
    },
    {
      id: 'amc',
      title: 'AMC',
      icon: '🇦🇺',
      description: 'AMC course page and exam-specific study resources.',
      route: '/exams/amc',
      accent: 'course-amc'
    }
  ];

  const plabAdminItems = [
    {
      id: 'what-is-plab',
      title: 'What is PLAB',
      icon: '📝',
      description: 'Edit the PLAB introduction and overview information.'
    },
    {
      id: 'plab1-tips',
      title: 'PLAB 1 Tips',
      icon: '💡',
      description: 'Manage exam tips, strategy notes, and quick guidance.'
    },
    {
      id: 'plab2-guide',
      title: 'PLAB-2 Guide',
      icon: '🩺',
      description: 'Add, update, and delete sections for the Guide to PLAB-2 page.'
    },
    {
      id: 'plab2-pretest',
      title: 'PLAB-2 Pretest Scenarios',
      icon: '🎭',
      description: 'Add scenario questions and ideal answers shown in the PLAB-2 pretest page.'
    },
    {
      id: 'plab1-tests',
      title: 'PLAB-1 Tests',
      icon: '✅',
      description: 'Create and manage timed SBA questions for the PLAB-1 test page.'
    }
  ];

  const usmleAdminItems = [
    {
      id: 'usmle-introduction',
      title: 'USMLE Step 1 Introduction',
      icon: '📘',
      description: 'Add and update content for the user-facing Step 1 Introduction page.'
    },
    {
      id: 'usmle-step1-pretest',
      title: 'USMLE Step 1 Pre-Test',
      icon: '🧪',
      description: 'Add 7-block exam questions with options, correct answers, and explanations.'
    },
    {
      id: 'usmle-step2-pretest',
      title: 'USMLE Step 2 CK Pre-Test',
      icon: '🧪',
      description: 'Add 8-block exam questions with options, correct answers, and explanations.'
    },
    {
      id: 'usmle-step3-pretest',
      title: 'USMLE Step 3 Pre-Test',
      icon: '🧪',
      description: 'Add Day 1 and Day 2 questions separately with options, correct answers, and explanations.'
    }
  ];

  const amcAdminItems = [
    {
      id: 'amc-step1-pretest',
      title: 'AMC Step 1 Pretest (CAT)',
      icon: '🧪',
      description: 'Add and publish Step 1 best-of-four questions, correct answers, and explanations.'
    }
    ,
    {
      id: 'amc-step2-pretest',
      title: 'AMC Step 2 Pretest (OSCE)',
      icon: '🎯',
      description: 'Add and publish Step 2 stations, marking notes, and optional images.'
    }
  ];

  const websiteAdminItems = [
    {
      id: 'about-content',
      title: 'Manage About Us',
      icon: 'ℹ️',
      description: 'Add, update, and remove About Us section details shown on the home page.'
    },
    {
      id: 'contact-content',
      title: 'Manage Contact Us',
      icon: '📞',
      description: 'Add, update, and remove Contact Us resources, FAQ, and support details.'
    }
  ];

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
          <p className="subtitle">Manage your course sections and PLAB content in one place</p>
        </header>

        {(activeSection === 'overview' || activeSection === 'courses') && (
          <div className="overview-section">
            <div className="section-title-wrap">
              <h2>4 Course Sections</h2>
              <p>Open and review each course experience directly from admin.</p>
            </div>

            <div className="course-sections-grid">
              {courseSections.map((course) => (
                <div key={course.id} className={`course-section-card ${course.accent}`}>
                  <div className="course-header">
                    <span className="course-icon">{course.icon}</span>
                    <h3>{course.title}</h3>
                  </div>
                  <p>{course.description}</p>
                  <button
                    className="card-action"
                    onClick={() => {
                      if (course.id === 'plab') {
                        handleNavigation('plab-admin');
                      } else if (course.id === 'amc') {
                        handleNavigation('usmle-admin');
                      } else {
                        window.location.href = course.route;
                      }
                    }}
                  >
                    {(course.id === 'plab' || course.id === 'usmle' || course.id === 'amc') ? 'Open Admin →' : 'Open Course →'}
                  </button>
                </div>
              ))}
            </div>

            <div className="section-title-wrap">
              <h2>Website Sections</h2>
              <p>Manage public home page website content directly.</p>
            </div>

            <div className="plab-management-grid">
              {websiteAdminItems.map((item) => (
                <div
                  key={item.id}
                  className="management-card"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="card-header">
                    <span className="card-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                  <button className="card-action">Manage →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'plab-admin' && (
          <div className="manage-plab-section">
            <h2>PLAB Admin Section</h2>
            <div className="plab-management-grid">
              {plabAdminItems.map((item) => (
                <div
                  key={item.id}
                  className="management-card"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="card-header">
                    <span className="card-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                  <button className="card-action">Manage →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'usmle-admin' && (
          <div className="manage-plab-section">
            <h2>USMLE Admin Section</h2>
            <p className="subtitle">Subjects and subject content are available from the sidebar under Subjects &amp; Content (All).</p>
            <div className="plab-management-grid">
              {usmleAdminItems.map((item) => (
                <div
                  key={item.id}
                  className="management-card"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="card-header">
                    <span className="card-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                  <button className="card-action">Manage →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'amc-admin' && (
          <div className="manage-plab-section">
            <h2>AMC Admin Section</h2>
            <p className="subtitle">Subjects and subject content are available from the sidebar under Subjects &amp; Content (All).</p>
            <div className="plab-management-grid">
              {amcAdminItems.map((item) => (
                <div
                  key={item.id}
                  className="management-card"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="card-header">
                    <span className="card-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                  <button className="card-action">Manage →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'website-admin' && (
          <div className="manage-plab-section">
            <h2>Website Admin Section</h2>
            <div className="plab-management-grid">
              {websiteAdminItems.map((item) => (
                <div
                  key={item.id}
                  className="management-card"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="card-header">
                    <span className="card-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                  <button className="card-action">Manage →</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'subjects-content-admin' && (
          <div className="manage-plab-section">
            <h2>Unified Subjects & Content</h2>
            <div className="plab-management-grid">
              <div
                className="management-card"
                onClick={() => handleNavigation('all-subjects-content')}
              >
                <div className="card-header">
                  <span className="card-icon">🧩</span>
                  <h3>All Categories: Subjects + Content</h3>
                </div>
                <p>Manage PLAB (PLAB-1 + PLAB-2 Theory Bank), USMLE, AMC, and NExT subjects in one page and open subject content editor directly.</p>
                <button className="card-action">Open →</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
