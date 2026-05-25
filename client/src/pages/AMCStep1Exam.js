import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AMCStep1Exam.css';
import './USMLEStep1Exam.css';

const TIMER_RADIUS = 44;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

function AMCStep1Exam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [reviewMode, setReviewMode] = useState('all');

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/plab-tests/amc-step1-pretest');
        const data = await response.json();

        if (!response.ok || !data.success || !data.data) {
          setError('AMC Step 1 pretest is not available right now.');
          return;
        }

        const loadedTest = {
          ...data.data,
          questions: [...(data.data.questions || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
        };

        if (!loadedTest.questions.length) {
          setError('No AMC Step 1 pretest questions are published yet.');
          return;
        }

        setTest(loadedTest);
        const averageSeconds = Number(loadedTest.questionTimeSeconds) || 84;
        const examSeconds = Math.max(loadedTest.questions.length * averageSeconds, 1);
        setRemainingSeconds(examSeconds);
      } catch (fetchError) {
        console.error('Error fetching AMC Step 1 pretest:', fetchError);
        setError('Unable to load AMC Step 1 pretest right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, []);

  useEffect(() => {
    if (loading || submitted) {
      return undefined;
    }

    if (remainingSeconds <= 0) {
      setSubmitted(true);
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted, remainingSeconds]);

  const sanitizeExplanationHtml = (html = '') => {
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

  const totalQuestions = test?.questions?.length || 0;
  const averageQuestionSeconds = Number(test?.questionTimeSeconds) || 84;
  const totalExamSeconds = Math.max(totalQuestions * averageQuestionSeconds, 1);
  const currentQuestion = test?.questions?.[currentIndex] || null;
  const selectedAnswer = answers[currentIndex] || '';
  const timerRatio = Math.min(Math.max(remainingSeconds / totalExamSeconds, 0), 1);
  const timerDashOffset = TIMER_CIRCUMFERENCE * (1 - timerRatio);

  const attemptedCount = useMemo(
    () => Object.values(answers).filter((value) => Boolean(value)).length,
    [answers]
  );

  const score = useMemo(() => {
    if (!test?.questions?.length) {
      return 0;
    }

    return test.questions.reduce((count, question, index) => {
      return answers[index] === question.correctOption ? count + 1 : count;
    }, 0);
  }, [test, answers]);

  const percentageScore = Math.round((score / Math.max(totalQuestions, 1)) * 100);

  const reviewedQuestions = useMemo(() => {
    const list = (test?.questions || []).map((question, index) => ({ question, index }));
    if (reviewMode === 'incorrect') {
      return list.filter(({ question, index }) => answers[index] !== question.correctOption);
    }
    return list;
  }, [test, answers, reviewMode]);


  const formatTime = (seconds) => {
    const safeSeconds = Math.max(seconds, 0);
    const hrs = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionKey) => {
    if (submitted) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionKey
    }));
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelSubmit = () => setShowSubmitConfirm(false);

  if (loading) {
    return <div className="amc-step1-exam-loading">Loading AMC Step 1 pretest...</div>;
  }

  if (error) {
    return (
      <div className="amc-step1-exam-page">
        <Header />
        <main className="amc-step1-exam-content">
          <section className="amc-step1-exam-card">
            <h1>AMC Step 1 Pretest</h1>
            <p>{error}</p>
            <button
              type="button"
              className="amc-step1-exam-btn primary"
              onClick={() => navigate('/exams/amc/step1-pretest')}
            >
              Back to Pretest
            </button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="amc-step1-exam-page">
      <Header />

      <main className="amc-step1-exam-content">
        <section className="amc-step1-exam-card" aria-label="AMC Step 1 exam panel">
          <div className="amc-step1-exam-topbar">
            <div>
              <p className="amc-step1-exam-kicker">AMC Step 1</p>
              <h1>{test?.title || 'Computer-Adaptive Test'}</h1>
              <p className="amc-step1-exam-instructions">{test?.instructions}</p>
            </div>
            {!submitted && (
              <div className="exam-timer-row" aria-label="Time remaining">
                <div className="timer-circle minutes">
                  <div className="timer-value">{String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}</div>
                  <div className="timer-label">MINUTES</div>
                </div>

                <div className="timer-circle seconds">
                  <div className="timer-value">{String(remainingSeconds % 60).padStart(2, '0')}</div>
                  <div className="timer-label">SECONDS</div>
                </div>

                <div className="timer-circle answered">
                  <div className="timer-value">{attemptedCount}</div>
                  <div className="timer-label">ANSWERED</div>
                </div>
              </div>
            )}
          </div>

          {!submitted && currentQuestion && (
            <>
              <div className="amc-step1-progress-row">
                <span>Question {currentIndex + 1} / {totalQuestions}</span>
                <span>Answered: {attemptedCount}</span>
                <span>Average: {averageQuestionSeconds}s per question</span>
              </div>

              <article className="amc-step1-question-card">
                <h2>{currentQuestion.questionText}</h2>

                {currentQuestion.imageUrl && (
                  <div className="amc-step1-question-image-wrap">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question illustration"
                      className="amc-step1-question-image"
                    />
                  </div>
                )}

                <ul className="amc-step1-option-list">
                  {(currentQuestion.options || []).map((option) => (
                    <li key={option.key}>
                      <button
                        type="button"
                        className={`amc-step1-option-btn ${selectedAnswer === option.key ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer(option.key)}
                      >
                        <span className="option-key">{option.key}</span>
                        <span>{option.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>

              <div className="amc-step1-exam-actions">
                <button
                  type="button"
                  className="amc-step1-exam-btn secondary"
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    className="amc-step1-exam-btn primary"
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="amc-step1-exam-btn submit"
                    onClick={handleSubmit}
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </>
          )}

          {submitted && (
            <section className="amc-step1-results" aria-label="AMC Step 1 review">
              <h2>Exam Result</h2>
                <div className="amc-step1-score">
                  <div className="score-circle">
                    <strong>{percentageScore}%</strong>
                  </div>
                  <div className="score-meta">{score} / {totalQuestions} correct</div>
                </div>

                <div className="amc-step1-exam-actions">
                <div className="review-action-group">
                  <button className={`review-action-btn ${reviewMode === 'all' ? 'active' : ''}`} onClick={() => setReviewMode('all')}>
                    Review All
                  </button>
                  <button className={`review-action-btn ${reviewMode === 'incorrect' ? 'active' : ''}`} onClick={() => setReviewMode('incorrect')}>
                    Review Incorrect Only
                  </button>
                </div>

                <div className="exam-result-actions">
                  <button
                    type="button"
                    className="amc-step1-exam-btn primary"
                    onClick={() => {
                      setSubmitted(false);
                      setCurrentIndex(0);
                      setAnswers({});
                      setRemainingSeconds(totalExamSeconds);
                      setReviewMode('all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate('/exams/amc/step1-pretest');
                    }}
                  >
                    Reattempt Exam
                  </button>
                  <button
                    type="button"
                    className="amc-step1-exam-btn"
                    onClick={() => {
                      // Exit the exam and return to the AMC landing page
                      navigate('/exams/amc');
                    }}
                    style={{ marginLeft: '12px' }}
                  >
                    Exit to AMC
                  </button>
                </div>
              </div>

                <div className="amc-step1-review-list">
                {reviewedQuestions.map(({ question, index }) => {
                  const userAnswer = answers[index] || null;
                  const isCorrect = userAnswer === question.correctOption;

                  return (
                    <article key={`${question._id || 'q'}-${index}`} className={`amc-step1-review-card ${isCorrect ? 'card-correct' : 'card-wrong'}`}>
                      <div className="review-head">
                        <h3>Q{index + 1}. {question.questionText}</h3>
                        <div className={`amc-step1-review-status ${isCorrect ? 'correct' : 'wrong'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>

                      {question.imageUrl && (
                        <div className="amc-step1-question-image-wrap review-image-wrap">
                          <img
                            src={question.imageUrl}
                            alt={`Question ${index + 1} illustration`}
                            className="amc-step1-question-image"
                          />
                        </div>
                      )}

                      <ul className="amc-review-options">
                        {(question.options || []).map((opt) => {
                          const isCorrectOpt = opt.key === question.correctOption;
                          const isUserChoice = userAnswer === opt.key;
                          const cls = `amc-review-option ${isCorrectOpt ? 'correct' : ''} ${isUserChoice ? 'user-choice' : ''}`;
                          return (
                            <li key={opt.key} className={cls}>
                              <div className="opt-left">
                                <span className="opt-key">{opt.key}</span>
                                <span className="opt-text">{opt.text}</span>
                              </div>
                              <div className="opt-right">
                                {isCorrectOpt && <span className="opt-badge correct">✓ Correct</span>}
                                {isUserChoice && !isCorrectOpt && <span className="opt-badge wrong">✕ Your answer</span>}
                                {isUserChoice && isCorrectOpt && <span className="opt-badge correct small">Your answer</span>}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      {question.explanation && (
                        <div className="amc-step1-review-explanation">
                          <strong>Explanation</strong>
                          <div dangerouslySetInnerHTML={{ __html: sanitizeExplanationHtml(question.explanation) }} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </section>
      </main>

      {showSubmitConfirm && (
        <div className="amc-confirm-overlay" role="presentation" onClick={cancelSubmit}>
          <section className="amc-confirm-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Exam</h3>
            <p>Are you sure you want to submit the exam now? You won't be able to change answers after submitting.</p>
            <div className="amc-confirm-actions">
              <button className="amc-confirm-cancel" onClick={cancelSubmit}>Cancel</button>
              <button className="amc-confirm-ok" onClick={confirmSubmit}>Submit Now</button>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AMCStep1Exam;
