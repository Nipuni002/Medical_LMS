import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../config/api';
import './USMLEStep1Introduction.css';

function USMLEStep1Introduction() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sanitizeSectionHtml = (html = '') => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('script, iframe, object, embed, form').forEach((node) => node.remove());
    doc.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attr) => {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value.toLowerCase();

        if (attrName.startsWith('on') || attrValue.includes('javascript:')) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  useEffect(() => {
    const fetchIntroductionContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/usmle-introduction-content/step1`);
        const data = await response.json();

        if (data.success && data.data) {
          setContent(data.data);
          setError(null);
          return;
        }

        setError('Introduction content is not available yet.');
      } catch (fetchError) {
        console.error('Error fetching USMLE Step 1 introduction:', fetchError);
        setError('Failed to load introduction content.');
      } finally {
        setLoading(false);
      }
    };

    fetchIntroductionContent();
  }, []);

  return (
    <div className="usmle-step1-introduction-page">
      <Header />

      <main className="usmle-step1-introduction-content">
        <section className="usmle-step1-introduction-hero">
          <div>
            <h1>{content?.title || 'USMLE Step 1 Introduction'}</h1>
            <p>{content?.subtitle || 'Overview and orientation for your Step 1 preparation.'}</p>
          </div>
        </section>

        <section className="usmle-step1-introduction-panel">
          {loading ? (
            <p className="intro-empty-state">Loading introduction content...</p>
          ) : error ? (
            <p className="intro-empty-state">{error}</p>
          ) : (
            <div className="intro-sections">
              {(content?.sections || [])
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section, index) => (
                  <article key={section._id || index} className="intro-section-card">
                    <h3>{section.heading}</h3>
                    <div
                      className="intro-section-content"
                      dangerouslySetInnerHTML={{ __html: sanitizeSectionHtml(section.content || '') }}
                    />
                  </article>
                ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default USMLEStep1Introduction;
