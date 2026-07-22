import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const AdminLegalContent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('disclaimer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState({
    disclaimer: { title: '', lastUpdated: '', content: '' },
    'privacy-policy': { title: '', lastUpdated: '', content: '' },
    'terms-of-service': { title: '', lastUpdated: '', content: '' }
  });
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  const showNotification = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      showNotification('Access denied. Admin only.', 'error');
      navigate('/');
      return;
    }

    fetchLegalDocuments();
  }, [navigate]);

  const fetchLegalDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-content`);
      const data = await response.json();
      if (response.ok && data.success) {
        const docMap = { ...documents };
        data.data.forEach(doc => {
          if (docMap[doc.documentType]) {
            docMap[doc.documentType] = {
              title: doc.title || '',
              lastUpdated: doc.lastUpdated || '',
              content: doc.content || ''
            };
          }
        });
        setDocuments(docMap);
      } else {
        throw new Error(data.error || 'Failed to load documents');
      }
    } catch (err) {
      console.error(err);
      showNotification('Could not load legal documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, val) => {
    setDocuments(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: val
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const docData = documents[activeTab];

    if (!docData.title.trim()) {
      showNotification('Document Title is required', 'error');
      return;
    }
    if (!docData.lastUpdated.trim()) {
      showNotification('Last Updated date is required', 'error');
      return;
    }
    if (!docData.content.trim()) {
      showNotification('Document Content is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/legal-content/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(docData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showNotification('Document updated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to update document');
      }
    } catch (err) {
      console.error(err);
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Toast Notification */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: popupType === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: '600',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {popupMessage}
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>Manage Legal Content</h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Update Privacy Policy, Terms of Service, and Disclaimer</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard?section=website-admin')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '6px', borderRadius: '12px', marginBottom: '25px', gap: '5px' }}>
          {[
            { id: 'disclaimer', label: 'Disclaimer ⚖️' },
            { id: 'privacy-policy', label: 'Privacy Policy 🛡️' },
            { id: 'terms-of-service', label: 'Terms of Service 📜' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                border: 'none',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#475569',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editor Form Panel */}
        {loading ? (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px auto'
            }}></div>
            <p>Loading documents data...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Document Title</label>
                <input
                  type="text"
                  value={documents[activeTab].title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. Terms of Service"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Last Updated Date / Version</label>
                <input
                  type="text"
                  value={documents[activeTab].lastUpdated}
                  onChange={(e) => handleInputChange('lastUpdated', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. July 2026"
                />
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Document Content</label>
              <textarea
                value={documents[activeTab].content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                style={{
                  width: '100%',
                  height: '450px',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  fontFamily: 'monospace, system-ui',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Enter document text content here..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 30px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#1d4ed8'; }}
                onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#2563eb'; }}
              >
                {saving ? 'Saving...' : 'Save Changes 💾'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminLegalContent;
