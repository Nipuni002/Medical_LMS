import React, { useEffect, useState } from 'react';
import './AboutSection.css';

function AboutSection() {
  const [title, setTitle] = useState('About us');
  const [sections, setSections] = useState([
    {
      heading: 'Who We Are',
      content:
        'Enhance Medical Education is dedicated to helping medical students master their licensing and professional exams. We provide comprehensive study materials, practice questions, and expert-led courses covering all major medical subjects.',
      order: 1
    },
    {
      heading: 'How We Help',
      content:
        "Our platform combines innovative learning techniques with real-world medical knowledge to ensure you're fully prepared for your exams.",
      order: 2
    }
  ]);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/about-content/home-about');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          setTitle(data.data.title || 'About us');
          if (Array.isArray(data.data.sections) && data.data.sections.length > 0) {
            const sortedSections = [...data.data.sections].sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            );
            setSections(sortedSections);
          }
        }
      } catch (error) {
        console.error('Error loading About Us content:', error);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <h2>{title}</h2>
        <div className="about-content">
          {sections.map((section, index) => (
            <p key={`${section.heading}-${index}`}>{section.content}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
