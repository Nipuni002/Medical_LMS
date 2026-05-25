import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Test.css';

function PLAB1Test() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    fetchTest();
  }, []);

  useEffect(() => {
    if (loading || !test || !examStarted) {
      return undefined;
    }

    if (remainingSeconds <= 0) {
      handleEndTest();
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, test, remainingSeconds, examStarted]);

  const fetchTest = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/plab-tests/plab1-sba');
      const data = await response.json();

      if (!data.success || !data.data) {
        setError('No test is available right now.');
        setLoading(false);
        return;
      }

      const loadedTest = data.data;
      const sortedQuestions = [...(loadedTest.questions || [])].sort((a, b) => a.order - b.order);

      loadedTest.questions = sortedQuestions;
      setTest(loadedTest);
      setRemainingSeconds(sortedQuestions.length * (loadedTest.questionTimeSeconds || 60));
      setLoading(false);
    } catch (fetchError) {
      console.error('Error loading test:', fetchError);
      setError('Unable to load test questions right now.');
      setLoading(false);
    }
  };

  const totalQuestions = test?.questions?.length || 0;

  const totalDurationSeconds = useMemo(() => {
    if (!test || !test.questions) {
      return 0;
    }

    return test.questions.length * (test.questionTimeSeconds || 60);
  }, [test]);

  const timerParts = useMemo(() => {
    const minutes = Math.max(0, Math.floor(remainingSeconds / 60));
    const seconds = Math.max(0, remainingSeconds % 60);
    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  }, [remainingSeconds]);

  const handleStartExam = () => {
    setCurrentQuestionIndex(0);
    setExamStarted(true);
  };

  const handleSelectOption = (questionIndex, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionKey
    }));
  };

  const handleEndTest = () => {
    setShowSubmitConfirm(false);
    navigate('/plab/plab1/tests/review', {
      state: {
        test,
        answers,
        remainingSeconds
      }
    });
  };

  const handleConfirmEndTest = () => {
    setShowSubmitConfirm(true);
  };

  const handleCancelEndTest = () => {
    setShowSubmitConfirm(false);
  };

  const handleGoToQuestion = (questionIndex) => {
    if (questionIndex < 0 || questionIndex >= totalQuestions) {
      return;
    }

    setCurrentQuestionIndex(questionIndex);
  };

  const handlePreviousQuestion = () => {
    handleGoToQuestion(currentQuestionIndex - 1);
  };

  const handleNextQuestion = () => {
    handleGoToQuestion(currentQuestionIndex + 1);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const currentQuestion = test?.questions?.[currentQuestionIndex];

  if (loading) {
    return (
      <div className="plab1-test-page">
        <Header />
        <div className="plab1-test-loading">Loading test...</div>
        <Footer />
      </div>
    );
  }

  if (error || !test || !test.questions || test.questions.length === 0) {
    return (
      <div className="plab1-test-page">
        <Header />
        <div className="plab1-test-error">{error || 'No questions available.'}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="plab1-test-page">
      <Header />

      <main className="plab1-test-wrapper">
        <h1>{test.title}</h1>
        {!examStarted ? (
          <section className="exam-instruction-card">
            <h2>Exam Instructions</h2>
            <p className="plab1-test-instructions">{test.instructions}</p>

            <div className="exam-details-grid">
              <div className="exam-detail-box">
                <p className="exam-detail-value">{totalQuestions}</p>
                <p className="exam-detail-label">Total Questions</p>
              </div>
              <div className="exam-detail-box">
                <p className="exam-detail-value">{Math.ceil(totalDurationSeconds / 60)}</p>
                <p className="exam-detail-label">Minutes</p>
              </div>
              <div className="exam-detail-box">
                <p className="exam-detail-value">Single Best Answer</p>
                <p className="exam-detail-label">Question Type</p>
              </div>
            </div>

            <ul className="exam-rules-list">
              <li>Click Start Exam to begin the timer.</li>
              <li>Questions are shown one at a time with Previous and Next buttons.</li>
              <li>You can submit early or when the timer ends.</li>
            </ul>

            <button className="start-exam-btn" onClick={handleStartExam}>
              Start Exam
            </button>
          </section>
        ) : (
          <>
            <div className="plab1-test-timer-row">
              <div className="timer-badge">
                <span className="timer-value">{timerParts.minutes}</span>
                <span className="timer-label">MINUTES</span>
              </div>
              <div className="timer-badge">
                <span className="timer-value">{timerParts.seconds}</span>
                <span className="timer-label">SECONDS</span>
              </div>
              <div className="timer-badge timer-progress-badge">
                <span className="timer-value">{Object.keys(answers).length}</span>
                <span className="timer-label">ANSWERED</span>
              </div>
            </div>

            <section className="question-layout-grid">
              <article className="question-card question-list-card">
                {currentQuestion && (
                  <div className="question-block single-question-block">
                    <p className="question-progress">
                      Question {currentQuestionIndex + 1} of {test.questions.length}
                    </p>

                    <p className="question-text">{currentQuestion.questionText}</p>

                    <div className="options-list">
                      {currentQuestion.options.map((option) => (
                        <label key={option.key} className="option-item">
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            checked={answers[currentQuestionIndex] === option.key}
                            onChange={() => handleSelectOption(currentQuestionIndex, option.key)}
                          />
                          <span>
                            {option.key}. {option.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="question-actions">
                  <button
                    className="nav-btn secondary-btn"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button className="nav-btn next-btn" onClick={handleNextQuestion}>
                      Next
                    </button>
                  ) : (
                    <button className="nav-btn end-test-btn" onClick={handleConfirmEndTest}>
                      Finish Test
                    </button>
                  )}
                </div>
              </article>

              <aside className="question-status-panel">
                <h3>Question Pages</h3>

                <div className="status-summary-row">
                  <p className="status-summary complete-count">Completed: {answeredCount}</p>
                  <p className="status-summary incomplete-count">Incomplete: {unansweredCount}</p>
                </div>

                <div className="question-number-grid">
                  {test.questions.map((_, questionIndex) => {
                    const isCurrent = questionIndex === currentQuestionIndex;
                    const isAnswered = Boolean(answers[questionIndex]);
                    const statusClass = isAnswered ? 'is-complete' : 'is-incomplete';

                    return (
                      <button
                        key={`question-page-${questionIndex}`}
                        className={`question-number-btn ${statusClass} ${isCurrent ? 'is-current' : ''}`}
                        onClick={() => handleGoToQuestion(questionIndex)}
                        type="button"
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>

      {showSubmitConfirm && (
        <div className="submit-confirm-overlay" role="presentation" onClick={handleCancelEndTest}>
          <section
            className="submit-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="submit-confirm-icon" aria-hidden="true">
              !
            </div>

            <h2 id="submit-confirm-title">Submit Your Test?</h2>
            <p>
              You have answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong>{' '}
              questions.
            </p>
            <p className="submit-confirm-warning">
              {unansweredCount > 0
                ? `You still have ${unansweredCount} unanswered question${unansweredCount === 1 ? '' : 's'}.`
                : 'Great work. All questions are answered.'}
            </p>

            <div className="submit-confirm-actions">
              <button type="button" className="submit-cancel-btn" onClick={handleCancelEndTest}>
                Continue Exam
              </button>
              <button type="button" className="submit-confirm-btn" onClick={handleEndTest}>
                Yes, Submit Test
              </button>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default PLAB1Test;
