import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../config/api';

const LegalPage = ({ type }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDoc();
  }, [type]);

  const fetchDoc = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-content/${type}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setDoc(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch document.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedContent = (content) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        return <div key={idx} style={{ height: '14px' }}></div>;
      }
      
      const sectionMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (sectionMatch) {
        return (
          <h3 
            key={idx} 
            style={{ 
              fontSize: '1.3rem', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginTop: '28px', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            <span style={{ color: '#2563eb' }}>{sectionMatch[1]}.</span>
            <span>{sectionMatch[2]}</span>
          </h3>
        );
      }
      
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const itemText = trimmed.substring(1).trim();
        return (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              gap: '8px', 
              paddingLeft: '16px', 
              marginBottom: '8px',
              fontSize: '1rem',
              color: '#475569',
              lineHeight: '1.6'
            }}
          >
            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>•</span>
            <span>{itemText}</span>
          </div>
        );
      }
      
      return (
        <p 
          key={idx} 
          style={{ 
            margin: '0 0 12px 0', 
            fontSize: '1.025rem', 
            color: '#475569', 
            lineHeight: '1.75',
            textAlign: 'justify'
          }}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ 
        flex: 1, 
        padding: '120px 20px 60px 20px', 
        maxWidth: '850px', 
        margin: '0 auto', 
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '15px'
            }}></div>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Loading policy document...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fee2e2', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center', 
            color: '#b91c1c' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>Error Loading Document</h3>
            <p style={{ margin: 0 }}>{error}</p>
            <button 
              onClick={fetchDoc} 
              style={{
                marginTop: '15px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        ) : doc ? (
          <article style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px -2px rgba(51, 65, 85, 0.08)',
            border: '1px solid #e2e8f0',
            padding: '45px',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <header style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '30px' }}>
              <h1 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '2.25rem', 
                fontWeight: '700', 
                color: '#0f172a',
                lineHeight: '1.2'
              }}>
                {doc.title}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                Last Updated: {doc.lastUpdated}
              </p>
            </header>

            <section style={{ 
              color: '#334155', 
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {renderFormattedContent(doc.content)}
            </section>

            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </article>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default LegalPage;
