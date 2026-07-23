import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleNavClick = (e, targetId, route = '/') => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (location.pathname === '/' || location.pathname === '') {
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(route + targetId);
      setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHomePage = location.pathname === '/' || location.pathname === '';

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''} ${!isHomePage ? 'header-light' : ''}`}>
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor={isHomePage ? "#001f5c" : "#ffffff"}/>
                  <stop offset="1" stopColor={isHomePage ? "#0066cc" : "#e0f2fe"}/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-main">
              <span className="logo-enhance">Enhance</span>
              <span className="logo-medical">Medical Education</span>
            </span>
          </div>
        </div>

        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <ul>
            <li><a href="#home" onClick={(e) => handleNavClick(e, '#home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>About Us</a></li>
            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact Us</a></li>
            <li><a href="/special-notices" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/special-notices'); }}>Special Notices</a></li>
            {user ? (
              <li><a href="#logout" className="nav-logout" onClick={(e) => { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); navigate('/'); }}>Logout ({user.name})</a></li>
            ) : (
              <li><a href="/special-notices" className="nav-cta" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/special-notices'); }}>Login/Register</a></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;