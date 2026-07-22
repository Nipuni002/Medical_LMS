import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../config/api';
import './ReviseQuestionsPage.css';

function ReviseQuestionsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const examParam = queryParams.get('exam') || '';

  // Determine correct examType and label
  let examType = 'PLAB_1';
  let examLabel = 'PLAB';

  if (examParam === 'PLAB_2') {
    examType = 'PLAB_2';
    examLabel = 'PLAB 2';
  } else if (examParam === 'PLAB_1') {
    examType = 'PLAB_1';
    examLabel = 'PLAB 1';
  } else if (examParam.toUpperCase() === 'AMC') {
    examType = 'AMC';
    examLabel = 'AMC';
  } else if (examParam.toUpperCase() === 'USMLE') {
    examType = 'USMLE';
    examLabel = 'USMLE';
  } else if (examParam.toUpperCase() === 'NEXT') {
    examType = 'NEXT';
    examLabel = 'NExT';
  } else {
    // Default fallback
    examType = 'PLAB_1';
    examLabel = 'PLAB';
  }

  const [subjectContent, setSubjectContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active quiz state
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIndex]: optionIndex }
  const [showExplanation, setShowExplanation] = useState({}); // { [qIndex]: true }
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    fetchSubjectContent();
  }, [subjectId, examType]);

  const processTopics = (rawTopics) => {
    return (rawTopics || []).map((topic) => {
      let sections = topic.mcqSections || [];
      if (sections.length === 0 && topic.mcqs && topic.mcqs.length > 0) {
        sections = [{ _id: 'legacy-general', title: 'General Practice', mcqs: topic.mcqs }];
      }
      return {
        ...topic,
        mcqSections: sections
      };
    });
  };

  const getTopicMcqCount = (topic) => {
    return (topic.mcqSections || []).reduce((acc, sec) => acc + (sec.mcqs?.length || 0), 0);
  };

  const fetchSubjectContent = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (examType === 'PLAB_1' || examType === 'PLAB_2') {
        endpoint = `${API_BASE_URL}/api/plab-theory-content/subject/${subjectId}?exam=${examType}`;
      } else if (examType === 'AMC') {
        endpoint = `${API_BASE_URL}/api/amc-theory-content/subject/${subjectId}`;
      } else if (examType === 'USMLE') {
        endpoint = `${API_BASE_URL}/api/usmle-theory-content/subject/${subjectId}`;
      } else if (examType === 'NEXT') {
        endpoint = `${API_BASE_URL}/api/next-theory-content/subject/${subjectId}`;
      }

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success && result.data) {
        const processedData = {
          ...result.data,
          topics: processTopics(result.data.topics)
        };
        setSubjectContent(processedData);

        const targetTopicId = queryParams.get('topicId');
        if (targetTopicId && processedData.topics) {
          const matched = processedData.topics.find((t) => t._id === targetTopicId);
          if (matched) {
            setActiveTopic(matched);
            setActiveSection(null);
          }
        }
      } else {
        setError('No content found for this subject.');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTopic = (topic) => {
    setActiveTopic(topic);
    setActiveSection(null);
    setQuizFinished(false);
  };

  const handleStartSection = (section) => {
    setActiveSection(section);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizFinished(false);
  };

  const handleBackToTopics = () => {
    setActiveTopic(null);
    setActiveSection(null);
    setQuizFinished(false);
  };

  const handleBackToSections = () => {
    setActiveSection(null);
    setQuizFinished(false);
  };

  const handleSelectOption = (qIndex, optionIndex) => {
    if (selectedAnswers[qIndex] !== undefined) return; // Already answered

    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex
    }));

    setShowExplanation((prev) => ({
      ...prev,
      [qIndex]: true
    }));
  };

  const handleNextQuestion = () => {
    if (!activeSection || !activeSection.mcqs) return;
    if (currentQuestionIndex < activeSection.mcqs.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!activeSection || !activeSection.mcqs) return 0;
    let correctCount = 0;
    activeSection.mcqs.forEach((mcq, idx) => {
      if (selectedAnswers[idx] === mcq.correctOption) {
        correctCount++;
      }
    });
    return correctCount;
  };

  if (loading) {
    return (
      <div className="revise-questions-page">
        <Header />
        <div className="rq-loading-container">
          <div className="rq-spinner"></div>
          <p>Loading questions bank...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !subjectContent) {
    return (
      <div className="revise-questions-page">
        <Header />
        <div className="rq-error-container">
          <div className="rq-error-icon">⚠️</div>
          <h2>Questions Unavailable</h2>
          <p>{error || 'Subject content not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="rq-back-btn"
          >
            ← Back to Theory Notes
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const topics = subjectContent.topics || [];
  const subjectTitle = subjectContent.subjectId?.name || subjectContent.title || 'Subject';

  return (
    <div className="revise-questions-page">
      <Header />

      <main className="rq-main-wrapper">
        <div className="rq-header-banner">
          <div className="rq-banner-content">
            <button className="rq-breadcrumb-btn" onClick={() => navigate(-1)}>
              ← Back to {subjectTitle} Notes
            </button>
            <h1 className="rq-main-title">{subjectTitle} - Section-Based Question Bank</h1>
            <p className="rq-main-subtitle">
              Select a section topic below to practice high-yield {examLabel} MCQs.
            </p>
          </div>
        </div>

        <div className="rq-container">
          {/* VIEW 1: TOPICS GRID VIEW */}
          {!activeTopic && (
            <div className="rq-sections-view">
              <div className="rq-section-summary-bar">
                <div className="rq-summary-badge">
                  <span className="badge-icon">📚</span>
                  <span><strong>{topics.length}</strong> Topics Available</span>
                </div>
                <div className="rq-summary-badge">
                  <span className="badge-icon">📝</span>
                  <span>
                    <strong>
                      {topics.reduce((acc, t) => acc + getTopicMcqCount(t), 0)}
                    </strong> Total MCQs
                  </span>
                </div>
              </div>

              {topics.length === 0 ? (
                <div className="rq-empty-sections">
                  <p>No question sections available for this subject yet.</p>
                </div>
              ) : (
                <div className="rq-section-cards-grid">
                  {topics.map((topic, index) => {
                    const mcqCount = getTopicMcqCount(topic);
                    const sectionsCount = topic.mcqSections?.length || 0;
                    return (
                      <div
                        key={topic._id || index}
                        className="rq-section-card"
                        onClick={() => handleStartTopic(topic)}
                      >
                        <div className="rq-card-header">
                          <div className="rq-card-number">{index + 1}</div>
                          <span className="rq-mcq-count-badge">
                            {sectionsCount} Section{sectionsCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <h3 className="rq-card-title">{topic.title}</h3>
                        <p className="rq-card-desc">
                          {mcqCount > 0
                            ? `Practice ${mcqCount} MCQs organized across ${sectionsCount} section${sectionsCount > 1 ? 's' : ''}.`
                            : 'No MCQ sections added yet.'}
                        </p>
                        <div className="rq-card-action">
                          <span className="rq-action-btn">
                            {sectionsCount > 0 ? 'View MCQ Sections →' : 'View Topic'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: MCQ SECTIONS LIST FOR SELECTED TOPIC */}
          {activeTopic && !activeSection && (
            <div className="rq-sections-view">
              <div className="rq-quiz-navigation-bar" style={{ marginBottom: '20px' }}>
                {!queryParams.get('topicId') && (
                  <button
                    className="rq-back-to-sections-btn"
                    onClick={handleBackToTopics}
                  >
                    ← Back to Topics List
                  </button>
                )}
                <div className="rq-quiz-section-title">
                  <span>Topic: </span>
                  <strong>{activeTopic.title}</strong>
                </div>
              </div>

              <div className="rq-section-summary-bar">
                <div className="rq-summary-badge">
                  <span className="badge-icon">📂</span>
                  <span><strong>{activeTopic.mcqSections?.length || 0}</strong> Sections</span>
                </div>
                <div className="rq-summary-badge">
                  <span className="badge-icon">📝</span>
                  <span>
                    <strong>
                      {getTopicMcqCount(activeTopic)}
                    </strong> MCQs Available
                  </span>
                </div>
              </div>

              {(!activeTopic.mcqSections || activeTopic.mcqSections.length === 0) ? (
                <div className="rq-empty-sections">
                  <p>No MCQ sections available for this topic yet.</p>
                </div>
              ) : (
                <div className="rq-section-cards-grid">
                  {activeTopic.mcqSections.map((section, index) => {
                    const count = section.mcqs?.length || 0;
                    return (
                      <div
                        key={section._id || index}
                        className="rq-section-card"
                        onClick={() => count > 0 && handleStartSection(section)}
                        style={{ cursor: count > 0 ? 'pointer' : 'default', opacity: count > 0 ? 1 : 0.7 }}
                      >
                        <div className="rq-card-header">
                          <div className="rq-card-number">{index + 1}</div>
                          <span className="rq-mcq-count-badge">
                            {count} MCQ{count === 1 ? '' : 's'}
                          </span>
                        </div>
                        <h3 className="rq-card-title">{section.title}</h3>
                        <p className="rq-card-desc">
                          {count > 0
                            ? `Practice ${count} questions in this section with detailed rationales.`
                            : 'No questions added yet.'}
                        </p>
                        <div className="rq-card-action">
                          <span className="rq-action-btn">
                            {count > 0 ? 'Start Revision →' : 'No Questions'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: INTERACTIVE MCQ RUNNER FOR ACTIVE SECTION */}
          {activeTopic && activeSection && (
            <div className="rq-quiz-view">
              <div className="rq-quiz-navigation-bar">
                <button
                  className="rq-back-to-sections-btn"
                  onClick={handleBackToSections}
                >
                  ← Back to MCQ Sections
                </button>
                <div className="rq-quiz-section-title">
                  <span>Section: </span>
                  <strong>{activeSection.title}</strong>
                </div>
              </div>

              {!activeSection.mcqs || activeSection.mcqs.length === 0 ? (
                <div className="rq-no-mcqs-card">
                  <h3>No MCQs Available</h3>
                  <p>Questions for "{activeSection.title}" have not been added yet by the admin.</p>
                  <button className="rq-primary-btn" onClick={handleBackToSections}>
                    Choose Another Section
                  </button>
                </div>
              ) : quizFinished ? (
                /* SECTION SCORE REPORT */
                <div className="rq-score-report-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div className="score-icon">🏆</div>
                  <h2>Section Revision Complete!</h2>
                  <p className="section-name">{activeSection.title}</p>
                  
                  <div className="score-circle">
                    <span className="score-number">
                      {calculateScore()} / {activeSection.mcqs.length}
                    </span>
                    <span className="score-label">Score</span>
                  </div>

                  <div className="score-actions" style={{ marginBottom: '30px' }}>
                    <button
                      className="rq-primary-btn"
                      onClick={() => handleStartSection(activeSection)}
                    >
                      🔄 Practice Section Again
                    </button>
                    <button
                      className="rq-secondary-btn"
                      onClick={handleBackToSections}
                    >
                      📋 Choose Another Section
                    </button>
                  </div>

                  {/* Question Review List with Explanations */}
                  <div className="quiz-review-section" style={{ marginTop: '40px', textAlign: 'left', width: '100%' }}>
                    <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.4rem', color: '#333' }}>Question Review & Explanations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      {activeSection.mcqs.map((mcq, qIdx) => {
                        const userAnsIdx = selectedAnswers[qIdx];
                        const isCorrect = userAnsIdx === mcq.correctOption;
                        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

                        return (
                          <div 
                            key={qIdx} 
                            style={{ 
                              padding: '20px', 
                              borderRadius: '8px', 
                              background: '#f9f9f9', 
                              borderLeft: `5px solid ${isCorrect ? '#2e7d32' : '#c62828'}`,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>Question {qIdx + 1}</span>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '4px', 
                                background: isCorrect ? '#e8f5e9' : '#ffebee', 
                                color: isCorrect ? '#2e7d32' : '#c62828',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                              }}>
                                {isCorrect ? 'Correct ✓' : 'Incorrect ✕'}
                              </span>
                            </div>
                            <p style={{ fontSize: '1.05rem', lineHeight: '1.5', margin: '0 0 15px 0', color: '#333' }}>{mcq.question}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                              {mcq.options.map((opt, oIdx) => {
                                const isUserSelected = userAnsIdx === oIdx;
                                const isCorrectOpt = mcq.correctOption === oIdx;
                                
                                let optStyle = {
                                  padding: '10px 15px',
                                  borderRadius: '6px',
                                  background: '#fff',
                                  border: '1px solid #ddd',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  color: '#333'
                                };
                                
                                if (isCorrectOpt) {
                                  optStyle.background = '#e8f5e9';
                                  optStyle.borderColor = '#2e7d32';
                                  optStyle.color = '#1b5e20';
                                  optStyle.fontWeight = 'bold';
                                } else if (isUserSelected && !isCorrectOpt) {
                                  optStyle.background = '#ffebee';
                                  optStyle.borderColor = '#c62828';
                                  optStyle.color = '#c62828';
                                }

                                return (
                                  <div key={oIdx} style={optStyle}>
                                    <span style={{ 
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      background: isCorrectOpt ? '#2e7d32' : (isUserSelected ? '#c62828' : '#eee'),
                                      color: isCorrectOpt || isUserSelected ? '#fff' : '#333',
                                      fontSize: '0.85rem',
                                      fontWeight: 'bold'
                                    }}>
                                      {optionLabels[oIdx] || oIdx + 1}
                                    </span>
                                    <span>{opt}</span>
                                    {isCorrectOpt && <span style={{ marginLeft: 'auto', color: '#2e7d32', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Correct Answer</span>}
                                    {isUserSelected && !isCorrectOpt && <span style={{ marginLeft: 'auto', color: '#c62828', fontWeight: 'bold', fontSize: '0.85rem' }}>✕ Your Choice</span>}
                                  </div>
                                );
                              })}
                            </div>

                            {mcq.explanation && (
                              <div style={{ 
                                padding: '15px', 
                                borderRadius: '6px', 
                                background: '#f1f8e9', 
                                borderLeft: '4px solid #8bc34a',
                                color: '#33691e',
                                fontSize: '0.95rem'
                              }}>
                                <strong>Explanation:</strong>
                                <p style={{ margin: '5px 0 0 0', lineHeight: '1.4' }}>{mcq.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* ACTIVE QUESTION CARD */
                <div className="rq-question-card">
                  {/* Progress Header */}
                  <div className="rq-question-progress-header">
                    <span className="question-counter">
                      Question {currentQuestionIndex + 1} of {activeSection.mcqs.length}
                    </span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${((currentQuestionIndex + 1) / activeSection.mcqs.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <div className="rq-question-stem">
                    <p>{activeSection.mcqs[currentQuestionIndex].question}</p>
                  </div>

                  {/* Options List */}
                  <div className="rq-options-list">
                    {activeSection.mcqs[currentQuestionIndex].options.map((optionText, optIdx) => {
                      const currentMcq = activeSection.mcqs[currentQuestionIndex];
                      const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                      const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                      const isCorrect = currentMcq.correctOption === optIdx;

                      let btnClass = 'rq-option-btn';
                      if (hasAnswered) {
                        if (isSelected) {
                          btnClass += ' selected';
                        } else {
                          btnClass += ' disabled';
                        }
                      }

                      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

                      return (
                        <button
                          key={optIdx}
                          className={btnClass}
                          onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                          disabled={hasAnswered}
                        >
                          <span className="option-label">{optionLabels[optIdx] || optIdx + 1}</span>
                          <span className="option-text">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation hidden during test - only shown on finish exam screen */}

                  {/* Footer Navigation Controls */}
                  <div className="rq-question-footer">
                    <button
                      className="rq-nav-btn prev"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      ← Previous
                    </button>

                    <button
                      className="rq-nav-btn next"
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                    >
                      {currentQuestionIndex === activeSection.mcqs.length - 1
                        ? 'Finish Section →'
                        : 'Next Question →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ReviseQuestionsPage;
