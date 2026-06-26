import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB2Guide.css';

function PLAB2Guide() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchPlab2Guide = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/plab-content/plab2-tips`);
        const data = await response.json();

        if (data.success) {
          setContent(data.data);
        }
      } catch (error) {
        console.error('Error fetching PLAB-2 guide content:', error);
      }
    };

    fetchPlab2Guide();
  }, []);

  const sanitizeGuideHtml = (html = '') => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('script, iframe, object, embed').forEach((node) => node.remove());
    doc.querySelectorAll('*').forEach((node) => {
      [...node.attributes].forEach((attr) => {
        if (attr.name.startsWith('on')) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  const sortedSections = content?.sections
    ? [...content.sections].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <div className="plab2-guide-page">
      <Header />

      <main className="plab2-guide-main">
        <div className="plab2-guide-hero">
          <div className="plab2-guide-hero-content">
            <h1>{content?.title || 'PLAB-2 Guide'}</h1>
            {content?.subtitle && <p>{content.subtitle}</p>}
          </div>
        </div>

        <div className="plab2-guide-container">
          {content?.description && (
            <section className="plab2-guide-card">
              <p>{content.description}</p>
            </section>
          )}

          {sortedSections.length > 0 ? (
            sortedSections.map((section) => (
              <section key={section._id || section.order || section.heading} className="plab2-guide-card">
                <h2>{section.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeGuideHtml(section.content || '') }}
                />
              </section>
            ))
          ) : (
            <section className="plab2-guide-card">
              <p>Guide content is not available yet. Please check back after the admin adds content.</p>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PLAB2Guide;
