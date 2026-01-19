import React from 'react';
import './AboutSection.css';

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <h2>About us</h2>
        <div className="about-content">
          <p>
            Enhance Medical Education is dedicated to helping medical students master their licensing and professional exams. We provide comprehensive study materials, practice questions, and expert-led courses covering all major medical subjects.
          </p>
          <p>
            Our platform combines innovative learning techniques with real-world medical knowledge to ensure you're fully prepared for your exams.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
