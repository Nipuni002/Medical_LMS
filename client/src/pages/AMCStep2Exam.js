import React, { useEffect, useState } from 'react';import API_BASE_URL from '../config/api';import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AMCStep2Exam.css';
import './USMLEStep1Exam.css';

function AMCStep2Exam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showPreferredAnswer, setShowPreferredAnswer] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/plab-tests/amc-step2-pretest`);
        const data = await res.json();
        if (!res.ok || !data.success || !data.data) {
          setError('AMC Step 2 pretest is not available right now.');
          return;
        }
        setTest(data.data);
        setCurrentStationIndex(0);
        setTimeLeft(Number(data.data.questionTimeSeconds) || 600);
      } catch (err) {
        console.error(err);
        setError('Unable to load AMC Step 2 pretest.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, []);

  const handleAnswerChange = (index, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [index]: value
    }));
  };

  const handleTogglePreferredAnswer = (index) => {
    setShowPreferredAnswer((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNextStation = () => {
    const totalStations = test?.questions?.length || 0;
    if (currentStationIndex < totalStations - 1) {
      setCurrentStationIndex((prev) => prev + 1);
    }
  };

  const handlePreviousStation = () => {
    if (currentStationIndex > 0) {
      setCurrentStationIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    navigate('/exams/amc/step2-pretest');
  };

  const formatTime = (secs) => {
    if (secs == null) return '--:--';
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!test) return;
    setTimeLeft(Number(test.questionTimeSeconds) || 600);
  }, [test]);

  useEffect(() => {
    if (!test) return;
    // reset timer for the new station
    setTimeLeft(Number(test.questionTimeSeconds) || 600);

    const totalStations = test?.questions?.length || 0;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentStationIndex < totalStations - 1) {
            setCurrentStationIndex((i) => i + 1);
            return Number(test.questionTimeSeconds) || 600;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStationIndex, test]);

  const currentStation = test?.questions?.[currentStationIndex];
  const totalStations = test?.questions?.length || 0;

  if (loading) return <div className="amc-step1-exam-loading">Loading...</div>;
  if (error)
    return (
      <div className="amc-step1-exam-page">
        <Header />
        <main className="amc-step1-exam-content">
          <section className="amc-step1-exam-card">
            <h1>AMC Step 2 Pretest</h1>
            <p>{error}</p>
            <button className="amc-step1-exam-btn primary" onClick={() => navigate('/exams/amc/step2-pretest')}>
              Back
            </button>
          </section>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="amc-step1-exam-page">
      <Header />
      <main className="amc-step1-exam-content">
        <section className="amc-step1-exam-card">
          <div className="amc-step1-exam-topbar">
            <div>
              <p className="amc-step1-exam-kicker">AMC Step 2</p>
              <h1>{test?.title || 'Clinical Examination Practice'}</h1>
              <p className="amc-step1-exam-instructions">{test?.instructions}</p>
            </div>
            <div className="exam-timer-row" aria-live="polite">
              <div className="timer-circle minutes">
                <div className="timer-value">{String(Math.floor((timeLeft || 0) / 60)).padStart(2, '0')}</div>
                <div className="timer-label">MINUTES</div>
              </div>

              <div className="timer-circle seconds">
                <div className="timer-value">{String((timeLeft || 0) % 60).padStart(2, '0')}</div>
                <div className="timer-label">SECONDS</div>
              </div>

              <div className="timer-circle answered">
                <div className="timer-value">{Object.values(userAnswers).filter(Boolean).length}</div>
                <div className="timer-label">ANSWERED</div>
              </div>
            </div>
          </div>

          <section className="amc-step1-results" aria-label="Stations list">
            <h2>Practice Stations</h2>

            {currentStation ? (
              <article className="amc-step1-review-card">
                <div className="review-head">
                  <h3>
                    Station {currentStationIndex + 1}. {currentStation.questionText}
                  </h3>
                </div>

                <p className="question-progress">
                  Station {currentStationIndex + 1} of {totalStations}
                </p>

                <label htmlFor={`amc-step2-answer-${currentStationIndex}`} className="amc-step2-answer-label">
                  Write your answer:
                </label>
                <textarea
                  id={`amc-step2-answer-${currentStationIndex}`}
                  className="amc-step2-answer-input"
                  rows={5}
                  value={userAnswers[currentStationIndex] || ''}
                  onChange={(event) => handleAnswerChange(currentStationIndex, event.target.value)}
                  placeholder="Write your answer here, then click Preferred Answers to compare."
                />

                <button
                  type="button"
                  className="amc-step1-exam-btn preferred-answer-btn"
                  onClick={() => handleTogglePreferredAnswer(currentStationIndex)}
                >
                  {showPreferredAnswer[currentStationIndex] ? 'Hide Preferred Answer' : 'Preferred Answers'}
                </button>

                {showPreferredAnswer[currentStationIndex] && currentStation.explanation && (
                  <div className="amc-step2-learning-box">
                    <div className="amc-step2-learning-section">
                      <strong>Explanation</strong>
                      <div dangerouslySetInnerHTML={{ __html: currentStation.explanation }} />
                    </div>
                  </div>
                )}

                {showPreferredAnswer[currentStationIndex] && !currentStation.explanation && (
                  <div className="amc-step2-learning-box">
                    <div className="amc-step2-learning-section">
                      <strong>Explanation</strong>
                      <p>No explanation added.</p>
                    </div>
                  </div>
                )}

                {currentStation.imageUrl && (
                  <div className="amc-step1-question-image-wrap review-image-wrap">
                    <img
                      src={currentStation.imageUrl}
                      alt={`Station ${currentStationIndex + 1}`}
                      className="amc-step1-question-image"
                    />
                  </div>
                )}

                <div className="question-actions">
                  <button
                    type="button"
                    className="amc-step1-exam-btn primary"
                    onClick={handlePreviousStation}
                    disabled={currentStationIndex === 0}
                  >
                    Previous
                  </button>
                  {currentStationIndex < totalStations - 1 ? (
                    <button
                      type="button"
                      className="amc-step1-exam-btn primary"
                      onClick={handleNextStation}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="amc-step1-exam-btn primary"
                      onClick={handleFinish}
                    >
                      Finish
                    </button>
                  )}
                </div>
              </article>
            ) : (
              <div className="amc-step1-review-card">
                <p>No stations available.</p>
              </div>
            )}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AMCStep2Exam;
