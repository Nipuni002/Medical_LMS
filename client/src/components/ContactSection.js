import React from 'react';
import './ContactSection.css';

function ContactSection() {
  const freeResources = [
    {
      title: 'Free Study Materials',
      description: 'Comprehensive library of medical study resources'
    },
    {
      title: 'Practice Questions',
      description: 'Thousands of free questions for medical exams'
    },
  ];

  const faqs = [
    {
      question: 'Are all courses free?',
      answer: 'Yes! All medical education courses and materials are completely free.'
    },
    {
      question: 'How do I access resources?',
      answer: 'Browse our website - all materials are available instantly without registration.'
    },
    {
      question: 'Can I download materials?',
      answer: 'Yes, most materials are available for download in PDF format.'
    },
  ];

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p className="section-subtitle">
            Access free medical education resources and support
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
                  <h4>Educational Support</h4>
                  <a href="mailto:education@enhancemedical.com" className="contact-email">
                    education@enhancemedical.com
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