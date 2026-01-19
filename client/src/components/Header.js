import React from 'react';
import './Header.css';

function Header() {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Enhance Medical Education</h1>
        </div>
        <nav className="nav">
          <ul>
            <li><a href="#home" onClick={(e) => handleNavClick(e, '#home')}>Home</a></li>
            <li><a href="#quick-links" onClick={(e) => handleNavClick(e, '#quick-links')}>Exams</a></li>
            <li><a href="#subjects" onClick={(e) => handleNavClick(e, '#subjects')}>Subjects</a></li>
            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>About</a></li>
            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
