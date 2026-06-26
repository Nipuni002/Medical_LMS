import React, { useEffect, useState } from 'react';
import './AboutSection.css';
import API_BASE_URL from '../config/api';

function AboutSection() {
  const [title, setTitle] = useState('About us');
  const [sections, setSections] = useState([
    {
      heading: 'Who We Are',
      content:
        'Enhance Medical Education provides the advanced curriculum and analytical tools necessary for medical professionals to excel in high-stakes licensing and board certification exams. Our platform is engineered for the busy clinician, offering a high-yield, streamlined approach that optimizes study time without compromising on depth.',
      order: 1
    },
    {
      heading: 'How We Help',
      content:
        "We blend sophisticated learning methodologies with current clinical standards, ensuring you are not only prepared to pass your examinations but also empowered to apply refined expertise directly to your practice.",
      order: 2
    }
  ]);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/about-content/home-about`);
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
