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
    title: 'USMLE',
    short: 'US',
    items: [
      { to: '/exams/usmle', label: 'Overview', short: 'OV' },
      { to: '/exams/usmle/step1-subjects', label: 'Step 1', short: 'S1' },
      { to: '/exams/usmle/step1-introduction', label: 'S1 Intro', short: 'IN' },
      { to: '/exams/usmle/step1-pretest', label: 'Step 1 Pretest', short: 'PT' },
      { to: '/exams/usmle/step1-pretest/exam', label: 'S1 Exam', short: 'EX' },
      { to: '/exams/usmle/step2-subjects', label: 'Step 2 CK', short: 'S2' },
      { to: '/exams/usmle/step2-pretest', label: 'S2 Pretest', short: 'PT' },
      { to: '/exams/usmle/step2-pretest/exam', label: 'S2 Exam', short: 'EX' },
      { to: '/exams/usmle/step3-subjects', label: 'Step 3', short: 'S3' },
      { to: '/exams/usmle/step3-pretest', label: 'S3 Pretest', short: 'PT' },
      { to: '/exams/usmle/step3-pretest/exam', label: 'S3 Exam', short: 'EX' }
    ]
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
  },
  {
    title: 'AMC',
    short: 'AM',
    items: [
      { to: '/exams/amc', label: 'Overview', short: 'OV' },
      { to: '/exams/amc/step1-subjects', label: 'Step 1', short: 'S1' },
      { to: '/exams/amc/step1-pretest', label: 'S1 Pretest', short: 'PT' },
      { to: '/exams/amc/step1-pretest/exam', label: 'S1 Exam', short: 'EX' },
      { to: '/exams/amc/step2-subjects', label: 'Step 2', short: 'S2' },
      { to: '/exams/amc/step2-pretest', label: 'S2 Pretest', short: 'PT' },
      { to: '/exams/amc/step2-pretest/exam', label: 'S2 Exam', short: 'EX' }
    ]
  }
];

function UserSideNav({ onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const isItemActive = (to) => {
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const isGroupActive = (items) => items.some((item) => isItemActive(item.to));

  return (
    <>
      <button
        type="button"
        className="side-nav-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Hide navigation menu' : 'Show navigation menu'}
      >
        {isOpen ? 'X' : 'NAV'}
      </button>

      {isOpen && (
        <aside className="user-side-nav">
          <button type="button" className="side-nav-brand" onClick={() => navigate('/')}>
            Exam Navigator
          </button>

          <nav className="side-nav-links" aria-label="User page navigation">
            {navGroups.map((group) => {
              const groupActive = isGroupActive(group.items);

              return (
                <div key={group.title} className={`side-nav-group ${groupActive ? 'active' : ''}`}>
                  <div className={`side-nav-group-title ${groupActive ? 'active' : ''}`} title={group.title}>
                    <span className={`side-nav-group-badge ${groupActive ? 'active' : ''}`}>{group.short}</span>
                    <span>{group.title}</span>
                  </div>

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
                </div>
              );
            })}
          </nav>
        </aside>
      )}
    </>
  );
}

export default UserSideNav;
