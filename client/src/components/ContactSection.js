import React, { useState } from 'react';
import './ContactSection.css';

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message. We will get back to you soon!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Get detailed responses within 24 hours',
      contact: 'support@enhancemedical.com'
    },
  ];

  const faqs = [
    {
      question: 'How can I access course materials?',
      answer: 'All course materials are available instantly upon enrollment through our learning portal.'
    },
    {
      question: 'Do you offer payment plans?',
      answer: 'Yes, we offer flexible payment plans for all premium courses and study programs.'
    },
    {
      question: 'Can I get a course preview?',
      answer: 'Absolutely! You can access free previews of all courses before making a purchase.'
    }
  ];

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Get in Touch</h2>
          <p className="section-subtitle">We're here to support your medical education journey</p>
        </div>

        <div className="contact-content">
          <div className="contact-methods">
            <h3>Contact Methods</h3>
            <div className="methods-grid">
              {contactMethods.map((method, index) => (
                <div key={index} className="method-card">
                  <div className="method-icon">{method.icon}</div>
                  <h4>{method.title}</h4>
                  <p className="method-description">{method.description}</p>
                  <p className="method-contact">{method.contact}</p>
                </div>
              ))}
            </div>

            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="form-card">
              <h3>Send us a Message</h3>
              <p className="form-subtitle">
                Have specific questions? Fill out the form below and our education specialists will respond promptly.
              </p>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="course-info">Course Information</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="billing">Billing Inquiry</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please provide details about your inquiry..."
                    rows="5"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <span>Send Message</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="contact-cta">
          <div className="cta-card">
            <h3>Ready to Enhance Your Medical Education?</h3>
            <p>Join thousands of successful medical students who have aced their exams with our comprehensive resources.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;