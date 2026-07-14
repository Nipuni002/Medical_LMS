import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './UserSideNav.css';

const navGroups = [
  {
    title: 'Study Hub',
    short: 'SH',
    items: [{ to: '/subjects', label: 'Subjects', short: 'SU' }]
  },
  {
    title: 'PLAB',
    short: 'PL',
    items: [
      { to: '/exams/plab', label: 'Overview', short: 'OV' },
      { to: '/plab/what-is-plab', label: 'What is PLAB', short: 'IN' },
      { to: '/plab/plab1-tips', label: 'PLAB 1 Tips', short: 'TP' },
      { to: '/plab/plab1/tests', label: 'PLAB 1 Tests', short: 'TS' },
      { to: '/plab/plab1/theory', label: 'PLAB 1 Theory', short: 'T1' },
      { to: '/plab/plab2/guide', label: 'PLAB 2 Guide', short: 'G2' },
      { to: '/plab/plab2/practice', label: 'PLAB 2 Practice', short: 'PR' },
      { to: '/plab/plab2/theory', label: 'PLAB 2 Theory', short: 'T2' }
    ]
  }
];

function UserSideNav({ onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isItemActive = (to) => {
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const isGroupActive = (items) => items.some((item) => isItemActive(item.to));

  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    navGroups.forEach((group) => {
      if (group.items.some((item) => window.location.pathname === item.to || window.location.pathname.startsWith(`${item.to}/`))) {
        initial[group.title] = true;
      }
    });
    // If no group is active (e.g. at main page), expand Study Hub by default
    if (Object.keys(initial).length === 0 && navGroups.length > 0) {
      initial[navGroups[0].title] = true;
    }
    return initial;
  });

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    const newExpanded = {};
    navGroups.forEach((group) => {
      if (isGroupActive(group.items)) {
        newExpanded[group.title] = true;
      }
    });
    setExpandedGroups((prev) => ({ ...prev, ...newExpanded }));
  }, [location.pathname]);

  const toggleGroup = (groupTitle) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  return (
    <>
      <button
        type="button"
        className={`side-nav-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Hide navigation menu' : 'Show navigation menu'}
      >
        {isOpen ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.25 1.8L10.2 0.75L6 4.95L1.8 0.75L0.75 1.8L4.95 6L0.75 10.2L1.8 11.25L6 7.05L10.2 11.25L11.25 10.2L7.05 6L11.25 1.8Z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12H18V10H0V12ZM0 7H18V5H0V7ZM0 0V2H18V0H0Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      <aside className={`user-side-nav ${isOpen ? 'open' : ''}`}>
        <button type="button" className="side-nav-brand" onClick={() => navigate('/')}>
          Exam Navigator
        </button>

        <nav className="side-nav-links" aria-label="User page navigation">
          {navGroups.map((group) => {
            const groupActive = isGroupActive(group.items);
            const isExpanded = !!expandedGroups[group.title];

            return (
              <div key={group.title} className={`side-nav-group ${groupActive ? 'active' : ''}`}>
                <div
                  className={`side-nav-group-title ${groupActive ? 'active' : ''}`}
                  onClick={() => toggleGroup(group.title)}
                  title={group.title}
                >
                  <span className={`side-nav-group-badge ${groupActive ? 'active' : ''}`}>{group.short}</span>
                  <span>{group.title}</span>
                  <span className={`side-nav-group-chevron ${isExpanded ? 'expanded' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>

                {isExpanded && (
                  <div className="side-nav-group-links">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`side-nav-link ${isItemActive(item.to) ? 'active' : ''}`}
                        title={`${group.title} - ${item.label}`}
                      >
                        <span className="side-nav-short">{item.short}</span>
                        <span className="side-nav-label">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default UserSideNav;
