import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-copy">
          <p>&copy; 2024 Enhance Medical Education. All rights reserved.</p>
          <p className="footer-disclaimer">
            &quot;Enhance Medical Education&quot; is an independent educational platform and is not affiliated
            with, endorsed by, or sponsored by the General Medical Council (GMC) for the PLAB examination, the
            Australian Medical Council (AMC), or the Educational Commission for Foreign Medical Graduates (ECFMG) /
            Federation of State Medical Boards (FSMB) for the USMLE examinations. All trademarks, service marks,
            and logos referenced on this site are the property of their respective owners. The information provided on
            this website is for educational purposes only and does not constitute official guidance or medical advice.
            Users are encouraged to verify the latest examination requirements and policies directly through the
            respective official council websites.
          </p>
        </div>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
