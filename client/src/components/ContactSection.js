import React, { useEffect, useMemo, useState } from 'react';
import './ContactSection.css';
import API_BASE_URL from '../config/api';

function ContactSection() {
  const [title, setTitle] = useState('Contact Us');
  const [subtitle, setSubtitle] = useState('Access free medical education resources and support');
  const [supportHeading, setSupportHeading] = useState('Educational Support');
  const [supportEmail, setSupportEmail] = useState('education@enhancemedical.com');
  const [freeResources, setFreeResources] = useState([
    {
      title: 'Free Study Materials',
      description: 'Comprehensive library of medical study resources',
      order: 1
    },
    {
      title: 'Practice Questions',
      description: 'Thousands of free questions for medical exams',
      order: 2
    }
  ]);
  const [faqs, setFaqs] = useState([
    {
      question: 'Are all courses free?',
      answer: 'Yes! All medical education courses and materials are completely free.',
      order: 1
    },
    {
      question: 'How do I access resources?',
      answer: 'Browse our website - all materials are available instantly without registration.',
      order: 2
    },
    {
      question: 'Can I download materials?',
      answer: 'Yes, most materials are available for download in PDF format.',
      order: 3
    }
  ]);

  useEffect(() => {
    const fetchContactContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact-content/home-contact`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          setTitle(data.data.title || 'Contact Us');
          setSubtitle(data.data.subtitle || 'Access free medical education resources and support');
          setSupportHeading(data.data.supportHeading || 'Educational Support');
          setSupportEmail(data.data.supportEmail || 'education@enhancemedical.com');

          if (Array.isArray(data.data.freeResources) && data.data.freeResources.length > 0) {
            setFreeResources(
              [...data.data.freeResources].sort((a, b) => (a.order || 0) - (b.order || 0))
            );
          }

          if (Array.isArray(data.data.faqs) && data.data.faqs.length > 0) {
            setFaqs(
              [...data.data.faqs].sort((a, b) => (a.order || 0) - (b.order || 0))
            );
          }
        }
      } catch (error) {
        console.error('Error loading Contact Us content:', error);
      }
    };

    fetchContactContent();
  }, []);

  const supportEmailHref = useMemo(() => {
    if (!supportEmail) return 'mailto:education@enhancemedical.com';
    return `mailto:${supportEmail}`;
  }, [supportEmail]);

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2>{title}</h2>
          <p className="section-subtitle">
            {subtitle}
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-column">
            <div className="contact-card">
              <h3>Free Resources</h3>
              <div className="resources-list">
                {freeResources.map((resource, index) => (
                  <div key={index} className="resource-item">
                    <div className="resource-icon">📚</div>
                    <div>
                      <h4>{resource.title}</h4>
                      <p>{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="contact-method">
                <div className="method-icon">📧</div>
                <div>
                  <h4>{supportHeading}</h4>
                  <a href={supportEmailHref} className="contact-email">
                    {supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-column">
            <div className="contact-card">
              <h3>FAQ</h3>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h4 className="faq-question">{faq.question}</h4>
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;