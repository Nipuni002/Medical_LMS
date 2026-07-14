import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TheorySubjectDetail.css';

function AMCTheorySubjectDetail() {
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

        if (attributeName.startsWith('on') || attributeValue.includes('javascript:')) {
          element.removeAttribute(attribute.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  const activeTopic = content?.topics?.[activeTopicIndex];
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
          <title>${topic?.title || 'Topic'} - ${content?.title || 'AMC Theory Content'}</title>
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
            <div class="subject-title">${content?.title || 'AMC Theory Content'}</div>
            <div class="topic-title">${topic?.title || 'Topic'}</div>
          </div>

          <div class="content-section">
            ${topicContentHtml}
          </div>

          <div class="document-footer">
            <div class="footer-brand">Medical LMS - AMC Theory Content</div>
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
        const response = await fetch(`${API_BASE_URL}/api/amc-theory-content/subject/${subjectId}`);
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
        console.error('Error fetching AMC content:', fetchError);
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
      navigate('/exams/amc/step2-subjects');
      return;
    }
    navigate('/exams/amc/step1-subjects');
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
            ← Back to AMC Subjects
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
              <h1 className="subject-title">{content?.title || 'AMC Theory Content'}</h1>
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
                {activeTopic && (
                  <div className="topic-detail">
                    <div className="topic-detail-header">
                      <h2>{activeTopic.title}</h2>
                    </div>

                    {activeTopic.videoLink && (
                      <div className="video-container">
                        {getVideoEmbedUrl(activeTopic.videoLink) ? (
                          <iframe
                            src={getVideoEmbedUrl(activeTopic.videoLink)}
                            title={activeTopic.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="video-link-fallback">
                            <p>Video available at:</p>
                            <a href={activeTopic.videoLink} target="_blank" rel="noopener noreferrer">
                              Open Video Link
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="action-buttons-section">
                      <button
                        onClick={() => navigate(`/questions/${subjectId}`)}
                        className="revise-questions-btn"
                      >
                        <span className="btn-icon">📝</span>
                        <span className="btn-text">Revise Questions</span>
                        <span className="btn-arrow">→</span>
                      </button>

                      <button onClick={handleDownloadPDF} className="pdf-download-btn" title="Download topic as PDF">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Notes
                      </button>
                    </div>

                    <div className="topic-text-content">
                      <div
                        className="content-text"
                        dangerouslySetInnerHTML={{
                          __html: activeTopicContentHtml || '<p>No content available.</p>'
                        }}
                      />
                    </div>

                    <div className="topic-navigation">
                      <button
                        onClick={() => setActiveTopicIndex((prev) => Math.max(0, prev - 1))}
                        disabled={activeTopicIndex === 0}
                        className="nav-btn prev-btn"
                      >
                        ← Previous Topic
                      </button>
                      <button
                        onClick={() =>
                          setActiveTopicIndex((prev) => Math.min(content.topics.length - 1, prev + 1))
                        }
                        disabled={activeTopicIndex === content.topics.length - 1}
                        className="nav-btn next-btn"
                      >
                        Next Topic →
                      </button>
                    </div>
                  </div>
                )}
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

export default AMCTheorySubjectDetail;
