import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, targetId, route = '/') => {
    e.preventDefault();
    
    // If we're already on the home page, just scroll to the section
    if (location.pathname === '/' || location.pathname === '') {
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to home page with section hash
      navigate(route + targetId);
      // After navigation, scroll to the section
      setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1>Enhance Medical Education</h1>
        </div>
        <nav className="nav">
          <ul>
            <li><a href="#home" onClick={(e) => handleNavClick(e, '#home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>About Us</a></li>
            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact Us</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
