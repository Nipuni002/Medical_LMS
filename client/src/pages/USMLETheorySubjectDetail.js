import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TheorySubjectDetail.css';

function USMLETheorySubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);

  const sanitizeHtml = (html = '') => {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('script, iframe, object, embed, form').forEach((element) => {
      element.remove();
    });

    doc.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        const attributeName = attribute.name.toLowerCase();
        const attributeValue = attribute.value.toLowerCase();

        if (attributeName.startsWith('on') || attributeValue.startsWith('java' + 'script:')) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  const activeTopic = content?.topics?.[activeTopicIndex];

  const openPdfInNewTab = (pdf) => {
    if (!pdf || !pdf.url) return;
    
    if (pdf.url.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Parts = pdf.url.split(',');
        const base64Data = base64Parts[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (error) {
        console.error('Error opening base64 PDF:', error);
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(
            `<iframe src="${pdf.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
          );
        }
      }
    } else {
      window.open(pdf.url, '_blank');
    }
  };

  const allPdfs = useMemo(() => {
    if (!activeTopic) return [];
    const list = [];
    if (activeTopic.pdfUrl) {
      list.push({
        name: 'Study Notes',
        url: activeTopic.pdfUrl
      });
    }
    if (activeTopic.pdfs && activeTopic.pdfs.length > 0) {
      activeTopic.pdfs.forEach((pdf) => {
        if (!list.some((p) => p.url === pdf.url)) {
          list.push(pdf);
        }
      });
    }
    return list;
  }, [activeTopic]);

  const activeTopicContentHtml = useMemo(
    () => sanitizeHtml(activeTopic?.content || ''),
    [activeTopic?.content]
  );

  const handleDownloadPDF = () => {
    if (!content?.topics?.length) return;

    const topic = content.topics[activeTopicIndex];
    const topicContentHtml = sanitizeHtml(topic?.content || '');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    const generatedAt = new Date();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${topic?.title || 'Topic'} - ${content?.title || 'USMLE Theory Content'}</title>
          <style>
            @page {
              margin: 2cm;
              size: A4;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.7;
              color: #1e293b;
              padding: 20px;
            }
            .document-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .subject-title {
              color: #1e40af;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .topic-title {
              color: #2563eb;
              font-size: 22px;
              font-weight: 600;
              margin-top: 10px;
            }
            .content-section {
              margin: 30px 0;
            }
            .content-section p {
              margin-bottom: 16px;
              text-align: justify;
              font-size: 14px;
              line-height: 1.8;
            }
            .content-section h3 {
              color: #1e40af;
              font-size: 18px;
              margin: 20px 0 12px 0;
            }
            .document-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e7ff;
              text-align: center;
              color: #64748b;
              font-size: 11px;
            }
            .footer-brand {
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="document-header">
            <div class="subject-title">${content?.title || 'USMLE Theory Content'}</div>
            <div class="topic-title">${topic?.title || 'Topic'}</div>
          </div>

          <div class="content-section">
            ${topicContentHtml}
          </div>

          <div class="document-footer">
            <div class="footer-brand">Medical LMS - USMLE Theory Content</div>
            <div>Generated: ${generatedAt.toLocaleDateString('en-GB')} at ${generatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/usmle-theory-content/subject/${subjectId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const sortedTopics = [...(result.data.topics || [])].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );

          setContent({ ...result.data, topics: sortedTopics });
          setError(null);
        } else {
          setError('Content not available for this subject yet.');
        }
      } catch (fetchError) {
        console.error('Error fetching USMLE content:', fetchError);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [subjectId]);

  const goBackToStep = () => {
    const contentStep = content?.subjectId?.step;
    if (contentStep === 'STEP_2') {
      navigate('/exams/usmle/step2-subjects');
      return;
    }
    if (contentStep === 'STEP_3') {
      navigate('/exams/usmle/step3-subjects');
      return;
    }
    navigate('/exams/usmle/step1-subjects');
  };

  const getVideoEmbedUrl = (videoLink) => {
    if (!videoLink) return null;
    
    const trimmedLink = videoLink.trim();

    // YouTube formats
    if (trimmedLink.includes('youtube.com') || trimmedLink.includes('youtu.be')) {
      let videoId = null;

      if (trimmedLink.includes('/shorts/')) {
        const parts = trimmedLink.split('/shorts/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      } else if (trimmedLink.includes('/embed/')) {
        const parts = trimmedLink.split('/embed/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      } else if (trimmedLink.includes('youtu.be/')) {
        const parts = trimmedLink.split('youtu.be/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      } else if (trimmedLink.includes('v=')) {
        const parts = trimmedLink.split('v=');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      } else if (trimmedLink.includes('/v/')) {
        const parts = trimmedLink.split('/v/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo formats
    if (trimmedLink.includes('vimeo.com')) {
      let videoId = null;
      if (trimmedLink.includes('player.vimeo.com/video/')) {
        const parts = trimmedLink.split('player.vimeo.com/video/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      } else {
        const parts = trimmedLink.split('vimeo.com/');
        if (parts[1]) {
          videoId = parts[1].split(/[?#&]/)[0];
        }
      }
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    // If it's already an embed link (e.g. from other hosting services) or contains an iframe src
    if (trimmedLink.startsWith('http') && (trimmedLink.includes('embed') || trimmedLink.includes('player'))) {
      return trimmedLink;
    }

    return null;
  };

  const getWeightageStyle = (weightage) => {
    switch (weightage) {
      case 'VERY HIGH WEIGHTAGE':
        return {
          bgColor: '#1e40af',
          icon: '🔥',
          label: 'VERY HIGH WEIGHTAGE'
        };
      case 'HIGH WEIGHTAGE':
        return {
          bgColor: '#7c3aed',
          icon: '⚡',
          label: 'HIGH WEIGHTAGE'
        };
      case 'MODERATE WEIGHTAGE':
        return {
          bgColor: '#0891b2',
          icon: '⚖️',
          label: 'MODERATE WEIGHTAGE'
        };
      case 'LOW WEIGHTAGE':
        return {
          bgColor: '#059669',
          icon: '📘',
          label: 'LOW WEIGHTAGE'
        };
      default:
        return {
          bgColor: '#64748b',
          icon: '📝',
          label: 'OTHER'
        };
    }
  };

  const getWeightageBadgeClass = (weightage) => {
    switch (weightage) {
      case 'VERY HIGH WEIGHTAGE':
        return 'very-high';
      case 'HIGH WEIGHTAGE':
        return 'high';
      case 'MODERATE WEIGHTAGE':
        return 'moderate';
      case 'LOW WEIGHTAGE':
        return 'low';
      default:
        return 'other';
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="theory-detail-loading">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="theory-detail-error">
          <div className="error-icon">⚠️</div>
          <h2>No Content Available</h2>
          <p>{error}</p>
          <button onClick={goBackToStep} className="back-btn">
            ← Back to USMLE Subjects
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const subjectWeightage = content?.subjectId?.weightage;
  const weightageStyle = getWeightageStyle(subjectWeightage);

  return (
    <>
      <Header />
      <div className="theory-subject-detail">
        <div className="detail-container">
          <div
            className="detail-header"
            style={{
              background: `linear-gradient(135deg, ${weightageStyle.bgColor} 0%, ${weightageStyle.bgColor}dd 100%)`
            }}
          >
            <div className="header-content">
              <div className="header-row">
                <div className={`weightage-badge ${getWeightageBadgeClass(subjectWeightage)}`}>
                  <span className="badge-icon">{weightageStyle.icon}</span>
                  <span className="badge-text">{weightageStyle.label}</span>
                </div>
                <span className="topics-count">📚 {content?.topics?.length || 0} Topics</span>
              </div>
              <h1 className="subject-title">{content?.title || 'USMLE Theory Content'}</h1>
            </div>
          </div>

          {content?.topics && content.topics.length > 0 ? (
            <div className="content-body">
              <div className="topics-nav">
                <h2>Topics</h2>
                <div className="topics-list">
                  {content.topics.map((topic, index) => (
                    <button
                      key={`${topic.title}-${index}`}
                      className={`topic-nav-item ${activeTopicIndex === index ? 'active' : ''}`}
                      onClick={() => setActiveTopicIndex(index)}
                    >
                      <span className="topic-number">{index + 1}</span>
                      <span className="topic-nav-title">{topic.title}</span>
                      {topic.videoLink && <span className="video-indicator">🎥</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="topic-content-display">
                {activeTopic && (() => {
                  const rawVideos = activeTopic.videoLinks && activeTopic.videoLinks.length > 0
                    ? activeTopic.videoLinks
                    : activeTopic.videoLink ? [activeTopic.videoLink] : [];
                  const videoList = rawVideos.map(v => (v || '').trim()).filter(Boolean);

                  return (
                    <div className="topic-detail">
                      <div className="topic-detail-header">
                        <h2>{activeTopic.title}</h2>
                      </div>

                      {/* STEP 1: TOPIC DESCRIPTION */}
                      {activeTopic.description && (
                        <div className="topic-description-section">
                          <h3 className="section-subtitle">Overview & Description</h3>
                          <p className="topic-description-text">{activeTopic.description}</p>
                        </div>
                      )}

                      {/* STEP 2: VIDEOS (DISPLAYED HORIZONTALLY 3 PER ROW) */}
                      {videoList.length > 0 && (
                        <div className="topic-videos-section">
                          <h3 className="section-subtitle">Video Lectures ({videoList.length})</h3>
                          <div className="videos-horizontal-grid">
                            {videoList.map((vUrl, vIdx) => {
                              const embedUrl = getVideoEmbedUrl(vUrl);
                              return (
                                <div key={vIdx} className="compact-video-card">
                                  {embedUrl ? (
                                    <iframe
                                      src={embedUrl}
                                      title={`${activeTopic.title} - Video ${vIdx + 1}`}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    ></iframe>
                                  ) : (
                                    <div className="video-link-fallback">
                                      <p>Video {vIdx + 1}</p>
                                      <a
                                        href={vUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="external-video-link"
                                      >
                                        Watch Video 🎥
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* STEP 3: NOTES & PDF (EMBEDDED PDF VIEWER + DOWNLOAD PDF BUTTON) */}
                      <div className="topic-notes-section">
                        <div className="notes-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                          <h3 className="section-subtitle" style={{ margin: 0 }}>Notes & Study Materials</h3>
                          <div className="notes-action-buttons">
                            <button
                              onClick={() => navigate(`/questions/${subjectId}?exam=USMLE&topicId=${activeTopic._id}`)}
                              className="revise-questions-btn"
                            >
                              <span className="btn-icon">📝</span>
                              <span className="btn-text">Revise Questions</span>
                              <span className="btn-arrow">→</span>
                            </button>
                          </div>
                        </div>

                        {/* PDF cards grid */}
                        {allPdfs.length > 0 ? (
                          <div className="pdf-selector-section" style={{ marginBottom: '25px' }}>
                            <h4 style={{ fontSize: '1rem', color: '#475569', marginBottom: '15px', fontWeight: '600' }}>Click PDF Document to Open in New Tab:</h4>
                            <div className="pdf-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                              {allPdfs.map((pdf, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => openPdfInNewTab(pdf)}
                                  style={{
                                    cursor: 'pointer',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    background: '#ffffff',
                                    border: '2px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.border = '2px solid #ef4444';
                                    e.currentTarget.style.background = '#fef2f2';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.border = '2px solid #e2e8f0';
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.transform = 'none';
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="48"
                                    height="48"
                                    fill="none"
                                    style={{ marginBottom: '8px' }}
                                  >
                                    <path
                                      d="M6 2H14L18 6V20C18 21.1 17.1 22 16 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z"
                                      fill="#EF4444"
                                    />
                                    <path
                                      d="M14 2V6H18L14 2Z"
                                      fill="#B91C1C"
                                      opacity="0.8"
                                    />
                                    <text
                                      x="12"
                                      y="15"
                                      fill="white"
                                      fontSize="5"
                                      fontWeight="bold"
                                      textAnchor="middle"
                                      fontFamily="Arial, sans-serif"
                                    >
                                      PDF
                                    </text>
                                  </svg>
                                  <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#334155',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.3'
                                  }}>
                                    {pdf.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="no-pdf-placeholder" style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>📄 No PDF notes uploaded for this topic yet.</p>
                          </div>
                        )}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="topic-navigation">
                        <button
                          onClick={() => setActiveTopicIndex(prev => Math.max(0, prev - 1))}
                          disabled={activeTopicIndex === 0}
                          className="nav-btn prev-btn"
                        >
                          ← Previous Topic
                        </button>
                        <button
                          onClick={() => setActiveTopicIndex(prev => 
                            Math.min(content.topics.length - 1, prev + 1)
                          )}
                          disabled={activeTopicIndex === content.topics.length - 1}
                          className="nav-btn next-btn"
                        >
                          Next Topic →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="theory-detail-error" style={{ marginTop: 20 }}>
              <h2>No Topics Available</h2>
              <p>This subject has no topics yet.</p>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default USMLETheorySubjectDetail;
