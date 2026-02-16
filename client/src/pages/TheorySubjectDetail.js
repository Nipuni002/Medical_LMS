import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TheorySubjectDetail.css';

function TheorySubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);

  const handleDownloadPDF = () => {
    const topic = content.topics[activeTopicIndex];
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${topic.title} - ${content.title}</title>
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
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="document-header">
            <div class="subject-title">${content.title}</div>
            <div class="topic-title">${topic.title}</div>
          </div>
          
          <div class="content-section">
            ${topic.content.split('\n').map(para => {
              if (para.trim()) {
                return `<p>${para.trim()}</p>`;
              }
              return '';
            }).join('')}
          </div>
          
          <div class="document-footer">
            <div class="footer-brand">Medical LMS - PLAB Theory Content</div>
            <div>Generated: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </body>
      </html>
    `;
    
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Wait for content to load, then trigger print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  useEffect(() => {
    fetchContent();
  }, [subjectId]);

  const fetchContent = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/plab-theory-content/subject/${subjectId}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setContent(result.data);
        setError(null);
      } else {
        setError('Content not available for this subject yet.');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbedUrl = (videoLink) => {
    if (!videoLink) return null;

    // YouTube
    if (videoLink.includes('youtube.com') || videoLink.includes('youtu.be')) {
      let videoId;
      if (videoLink.includes('youtu.be/')) {
        videoId = videoLink.split('youtu.be/')[1].split('?')[0];
      } else if (videoLink.includes('v=')) {
        videoId = videoLink.split('v=')[1].split('&')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo
    if (videoLink.includes('vimeo.com')) {
      const videoId = videoLink.split('vimeo.com/')[1].split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
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
          <button onClick={() => navigate('/plab1-theory')} className="back-btn">
            ← Back to Theory Subjects
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const weightageStyle = content?.subjectId?.weightage 
    ? getWeightageStyle(content.subjectId.weightage)
    : null;

  return (
    <>
      <Header />
      <div className="theory-subject-detail">
        <div className="detail-container">
          {/* Header Section */}
          <div 
            className="detail-header"
            style={{ 
              background: weightageStyle 
                ? `linear-gradient(135deg, ${weightageStyle.bgColor} 0%, ${weightageStyle.bgColor}dd 100%)`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <div className="header-content">
              <div className="header-row">
                {weightageStyle && (
                  <div className={`weightage-badge ${content.subjectId?.weightage === 'VERY HIGH WEIGHTAGE' ? 'very-high' : ''}`}>
                    <span className="badge-icon">{weightageStyle.icon}</span>
                    <span className="badge-text">{weightageStyle.label}</span>
                  </div>
                )}
                <span className="topics-count">
                  📚 {content.topics?.length || 0} Topics
                </span>
              </div>
              <h1 className="subject-title">{content.title}</h1>
            </div>
          </div>

          {/* Content Section */}
          {content.topics && content.topics.length > 0 ? (
            <div className="content-body">
              {/* Topics Navigation */}
              <div className="topics-nav">
                <h2>Topics</h2>
                <div className="topics-list">
                  {content.topics.map((topic, index) => (
                    <button
                      key={index}
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

              {/* Topic Content Display */}
              <div className="topic-content-display">
                {content.topics[activeTopicIndex] && (
                  <div className="topic-detail">
                    <div className="topic-detail-header">
                      <h2>{content.topics[activeTopicIndex].title}</h2>
                    </div>

                    {/* Video Player */}
                    {content.topics[activeTopicIndex].videoLink && (
                      <div className="video-container">
                        {getVideoEmbedUrl(content.topics[activeTopicIndex].videoLink) ? (
                          <iframe
                            src={getVideoEmbedUrl(content.topics[activeTopicIndex].videoLink)}
                            title={content.topics[activeTopicIndex].title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="video-link-fallback">
                            <p>Video available at:</p>
                            <a 
                              href={content.topics[activeTopicIndex].videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="external-video-link"
                            >
                              {content.topics[activeTopicIndex].videoLink}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Download Button */}
                    <div className="download-section">
                      <button onClick={handleDownloadPDF} className="pdf-download-btn" title="Download topic as PDF">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download PDF
                      </button>
                    </div>

                    {/* Topic Content */}
                    <div className="topic-text-content">
                      <div className="content-text">
                        {content.topics[activeTopicIndex].content.split('\n').map((paragraph, idx) => (
                          paragraph.trim() && <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
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
                )}
              </div>
            </div>
          ) : (
            <div className="no-topics">
              <p>No topics available for this subject yet.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TheorySubjectDetail;
