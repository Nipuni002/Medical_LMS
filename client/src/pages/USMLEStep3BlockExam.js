import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Test.css';
import './USMLEStep1Exam.css';

const DAY_LABELS = {
  DAY_1: 'Day 1 - Foundations of Independent Practice (FIP)',
  DAY_2: 'Day 2 - Advanced Clinical Medicine (ACM)'
};

const STEP3_MODE_KEY = 'usmle-step3-pretest-exam-mode';
const STEP3_COMPLETED_BLOCKS_KEY_PREFIX = 'usmle-step3-pretest-completed-blocks';
const STEP3_BREAK_KEY_PREFIX = 'usmle-step3-pretest-break';
const STEP3_BREAK_SECONDS = 45 * 60;

const getStep3CompletedBlocksKey = () => STEP3_COMPLETED_BLOCKS_KEY_PREFIX;
const getStep3BreakKey = (mode) => `${STEP3_BREAK_KEY_PREFIX}-${mode}`;

const normalizeStep3BlockCompletionStore = (value) => {
  const emptyStore = { DAY_1: {}, DAY_2: {} };

  if (!value || typeof value !== 'object') {
    return emptyStore;
  }

  const normalizedStore = { DAY_1: {}, DAY_2: {} };

  ['DAY_1', 'DAY_2'].forEach((dayKey) => {
    const blocks = value[dayKey];
    if (!blocks) {
      return;
    }

    if (Array.isArray(blocks)) {
      blocks.forEach((blockNumber) => {
        const numericBlock = Number(blockNumber);
        if (Number.isFinite(numericBlock) && numericBlock >= 1 && numericBlock <= 6) {
          normalizedStore[dayKey][numericBlock] = { completedAt: null, contentSignature: '' };
        }
      });
      return;
    }

    Object.entries(blocks).forEach(([blockNumber, blockState]) => {
      const numericBlock = Number(blockNumber);
      if (!Number.isFinite(numericBlock) || numericBlock < 1 || numericBlock > 6) {
        return;
      }

      if (blockState && typeof blockState === 'object') {
        normalizedStore[dayKey][numericBlock] = {
          completedAt: blockState.completedAt || null,
          contentSignature: blockState.contentSignature || ''
        };
      }
    });
  });

  return normalizedStore;
};

const getStep3BlockSignature = (questions) =>
  JSON.stringify(
    (questions || []).map((question) => ({
      id: question._id || '',
      questionText: question.questionText || '',
      options: Array.isArray(question.options)
        ? question.options.map((option) => ({ key: option.key || '', text: option.text || '' }))
        : [],
      correctOption: question.correctOption || '',
      explanation: question.explanation || '',
      imageUrl: question.imageUrl || '',
      order: Number(question.order) || 0
    }))
  );

const getNextStep3Block = (dayKey, blockNumber) => {
  const currentDay = dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1';
  const currentBlock = Number(blockNumber);
  const nextBlock = currentBlock + 1;

  if (currentDay === 'DAY_1' && nextBlock <= 6) {
    return { dayKey: 'DAY_1', blockNumber: nextBlock };
  }

  if (currentDay === 'DAY_1') {
    return { dayKey: 'DAY_2', blockNumber: 1 };
  }

  if (currentDay === 'DAY_2' && nextBlock <= 6) {
    return { dayKey: 'DAY_2', blockNumber: nextBlock };
  }

  return null;
};

function USMLEStep3BlockExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dayKey, blockNumber } = useParams();
  const [examMode, setExamMode] = useState(() => {
    const routeMode = location.state?.examMode;
    if (routeMode === 'free' || routeMode === 'professional') {
      return routeMode;
    }

    const savedMode = localStorage.getItem(STEP3_MODE_KEY);
    return savedMode === 'free' || savedMode === 'professional' ? savedMode : 'professional';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedCompletion, setSavedCompletion] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(STEP3_BREAK_SECONDS);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [finishDayOneConfirmOpen, setFinishDayOneConfirmOpen] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [reviewFilter, setReviewFilter] = useState('all');
  
  useEffect(() => {
    const routeMode = location.state?.examMode;
    if (routeMode === 'free' || routeMode === 'professional') {
      setExamMode(routeMode);
      localStorage.setItem(STEP3_MODE_KEY, routeMode);
      return;
    }

    const savedMode = localStorage.getItem(STEP3_MODE_KEY);
    if (savedMode === 'free' || savedMode === 'professional') {
      setExamMode(savedMode);
    }
  }, [location.state]);


  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/plab-tests/usmle-step3-pretest');
        const data = await response.json();

        if (!data.success || !data.data) {
          setError('USMLE Step 3 pre-test is not available right now.');
          return;
        }

        const loadedTest = data.data;
        loadedTest.questions = [...(loadedTest.questions || [])].sort((a, b) => {
          const dayA = a.examDay === 'DAY_2' ? 2 : 1;
          const dayB = b.examDay === 'DAY_2' ? 2 : 1;
          if (dayA !== dayB) {
            return dayA - dayB;
          }

          const blockA = Number(a.blockNumber) || 1;
          const blockB = Number(b.blockNumber) || 1;
          if (blockA !== blockB) {
            return blockA - blockB;
          }

          return (a.order || 0) - (b.order || 0);
        });

        setTest(loadedTest);

        try {
          const savedBreakRaw = localStorage.getItem(getStep3BreakKey(examMode));
          if (savedBreakRaw) {
            const savedBreak = JSON.parse(savedBreakRaw);
            const normalizedDayKey = dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1';
            const numericBlock = Number(blockNumber);

            if (
              savedBreak.dayKey === normalizedDayKey &&
              Number(savedBreak.blockNumber) === numericBlock &&
              Number.isFinite(Number(savedBreak.breakEndsAt))
            ) {
              const remaining = Math.max(0, Math.ceil((Number(savedBreak.breakEndsAt) - Date.now()) / 1000));
              setIsBreakActive(true);
              setBreakSecondsRemaining(remaining);
            }
          }
        } catch (e) {
          console.error('Error restoring Step 3 break state:', e);
          localStorage.removeItem(getStep3BreakKey(examMode));
        }
      } catch (fetchError) {
        console.error('Error fetching Step 3 block exam:', fetchError);
        setError('Unable to load block questions right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [examMode]);

  const blockQuestions = useMemo(() => {
    if (!test) {
      return [];
    }

    return (test.questions || []).filter((question) => {
      const normalizedDay = question.examDay === 'DAY_2' ? 'DAY_2' : 'DAY_1';
      return normalizedDay === dayKey && Number(question.blockNumber) === Number(blockNumber);
    });
  }, [test, dayKey, blockNumber]);

  useEffect(() => {
    if (!test || blockQuestions.length === 0 || isReviewMode) {
      return;
    }

    const totalSeconds = blockQuestions.length * (test.questionTimeSeconds || 90);
    setTimeRemaining(totalSeconds);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [test, blockQuestions, isReviewMode]);

  useEffect(() => {
    if (!test || blockQuestions.length === 0) {
      return;
    }

    try {
      const savedCompletedRaw = localStorage.getItem(getStep3CompletedBlocksKey());
      const savedCompleted = normalizeStep3BlockCompletionStore(
        savedCompletedRaw ? JSON.parse(savedCompletedRaw) : null
      );
      const normalizedDayKey = dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1';
      const numericBlock = Number(blockNumber);
      const currentSignature = getStep3BlockSignature(blockQuestions);
      const savedBlockState = savedCompleted[normalizedDayKey]?.[numericBlock];

      if (savedBlockState?.contentSignature === currentSignature) {
        setIsReviewMode(true);
        setSavedCompletion(true);
        return;
      }

      if (savedBlockState) {
        delete savedCompleted[normalizedDayKey][numericBlock];
        localStorage.setItem(getStep3CompletedBlocksKey(examMode), JSON.stringify(savedCompleted));
      }

      setIsReviewMode(false);
      setSavedCompletion(false);
    } catch (error) {
      console.error('Error restoring Step 3 completion state:', error);
      setIsReviewMode(false);
      setSavedCompletion(false);
    }
  }, [test, blockQuestions, dayKey, blockNumber, examMode]);

  useEffect(() => {
    if (!isBreakActive) {
      return undefined;
    }

    if (breakSecondsRemaining <= 0) {
      localStorage.setItem(
        getStep3BreakKey(examMode),
        JSON.stringify({
          dayKey: dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1',
          blockNumber: Number(blockNumber),
          breakEndsAt: Date.now()
        })
      );
      return undefined;
    }

    const interval = setInterval(() => {
      setBreakSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakActive, breakSecondsRemaining, dayKey, blockNumber, examMode]);

  useEffect(() => {
    if (!isBreakActive) {
      return;
    }

    const breakEndsAt = Date.now() + (breakSecondsRemaining * 1000);
    localStorage.setItem(
      getStep3BreakKey(examMode),
      JSON.stringify({
        dayKey: dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1',
        blockNumber: Number(blockNumber),
        breakEndsAt
      })
    );
  }, [isBreakActive, breakSecondsRemaining, dayKey, blockNumber, examMode]);

  const currentQuestion = blockQuestions[questionIndex] || null;
  const currentAnswerKey = `${dayKey}-${blockNumber}-${questionIndex}`;

  const calculateScore = () => {
    let correct = 0;
    blockQuestions.forEach((question, index) => {
      const answerKey = `${dayKey}-${blockNumber}-${index}`;
      if (answers[answerKey] === question.correctOption) {
        correct++;
      }
    });
    return {
      correct,
      total: blockQuestions.length,
      percentage: blockQuestions.length > 0 ? Math.round((correct / blockQuestions.length) * 100) : 0
    };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleSelectOption = (optionKey) => {
    // prevent changing answers if block already completed
    if (savedCompletion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentAnswerKey]: optionKey
    }));
  };

  const handleFinishBlock = () => {
    setFinishConfirmOpen(true);
  };

  const handleConfirmFinishBlock = () => {
    setFinishConfirmOpen(false);
    setIsReviewMode(true);
    // mark block completed immediately so next block unlocks
    markBlockCompleted();
  };

  const handleCancelFinishBlock = () => {
    setFinishConfirmOpen(false);
  };

  const handleOpenFinishDayOneConfirm = () => {
    setFinishDayOneConfirmOpen(true);
  };

  const handleCancelFinishDayOneConfirm = () => {
    setFinishDayOneConfirmOpen(false);
  };

  const handleConfirmFinishDayOneExam = () => {
    setFinishDayOneConfirmOpen(false);
    navigate('/exams/usmle/step3-pretest/exam');
  };

  const handleFinishDayTwoExam = () => {
    setIsBreakActive(false);
    localStorage.removeItem(getStep3BreakKey(examMode));
    navigate('/exams/usmle/step3-pretest');
  };

  const handleExitDayTwoExam = () => {
    setIsBreakActive(false);
    localStorage.removeItem(getStep3BreakKey(examMode));
    navigate('/exams/usmle');
  };

  const handleReattemptDayTwoExam = () => {
    setIsBreakActive(false);
    setFinishConfirmOpen(false);
    setFinishDayOneConfirmOpen(false);
    setIsReviewMode(false);
    setSavedCompletion(false);
    setQuestionIndex(0);
    setAnswers({});
    localStorage.removeItem(getStep3BreakKey(examMode));
    localStorage.removeItem(getStep3CompletedBlocksKey());
    localStorage.setItem(STEP3_MODE_KEY, 'professional');
    navigate('/exams/usmle/step3-pretest/exam', {
      state: {
        examMode: 'professional'
      }
    });
  };

  const handleGoToBreak = () => {
    const nextBlock = getNextStep3Block(dayKey, blockNumber);
    const breakEndsAt = Date.now() + (STEP3_BREAK_SECONDS * 1000);
    setBreakSecondsRemaining(STEP3_BREAK_SECONDS);
    setIsBreakActive(true);

    localStorage.setItem(
      getStep3BreakKey(examMode),
      JSON.stringify({
        dayKey: dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1',
        blockNumber: Number(blockNumber),
        nextDayKey: nextBlock?.dayKey || dayKey,
        nextBlockNumber: nextBlock?.blockNumber || Number(blockNumber) + 1,
        breakEndsAt
      })
    );
  };

  const handleReturnToBlocks = () => {
    markBlockCompleted();
    navigate('/exams/usmle/step3-pretest/exam');
  };

  const markBlockCompleted = () => {
    try {
      const savedCompletedRaw = localStorage.getItem(getStep3CompletedBlocksKey());
      const savedCompleted = normalizeStep3BlockCompletionStore(savedCompletedRaw ? JSON.parse(savedCompletedRaw) : null);

      const updatedCompleted = {
        DAY_1: { ...(savedCompleted.DAY_1 || {}) },
        DAY_2: { ...(savedCompleted.DAY_2 || {}) }
      };

      const normalizedDayKey = dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1';
      const numericBlock = Number(blockNumber);
      const currentSignature = getStep3BlockSignature(blockQuestions);

      if (updatedCompleted[normalizedDayKey]?.[numericBlock]?.contentSignature !== currentSignature) {
        updatedCompleted[normalizedDayKey][numericBlock] = {
          completedAt: new Date().toISOString(),
          contentSignature: currentSignature
        };
        localStorage.setItem(getStep3CompletedBlocksKey(), JSON.stringify(updatedCompleted));
        setSavedCompletion(true);
      }
    } catch (e) {
      console.error('Error marking Step 3 block completed:', e);
    }
  };

  const handleReattemptCurrentBlock = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      blockQuestions.forEach((_question, index) => {
        const answerKey = `${dayKey}-${blockNumber}-${index}`;
        if (Object.prototype.hasOwnProperty.call(next, answerKey)) {
          delete next[answerKey];
        }
      });
      return next;
    });

    try {
      const savedCompletedRaw = localStorage.getItem(getStep3CompletedBlocksKey());
      const savedCompleted = normalizeStep3BlockCompletionStore(savedCompletedRaw ? JSON.parse(savedCompletedRaw) : null);
      const normalizedDayKey = dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1';
      const numericBlock = Number(blockNumber);

      if (savedCompleted[normalizedDayKey]?.[numericBlock]) {
        delete savedCompleted[normalizedDayKey][numericBlock];
        localStorage.setItem(getStep3CompletedBlocksKey(), JSON.stringify(savedCompleted));
      }
    } catch (e) {
      console.error('Error resetting Step 3 block completion for reattempt:', e);
    }

    setSavedCompletion(false);
    setIsReviewMode(false);
    setQuestionIndex(0);
    setFinishConfirmOpen(false);
  };

  const startNextBlock = () => {
    setIsBreakActive(false);
    localStorage.removeItem(getStep3BreakKey(examMode));

    const nextBlock = getNextStep3Block(dayKey, blockNumber);
    if (nextBlock) {
      navigate(`/exams/usmle/step3-pretest/block/${nextBlock.dayKey}/${nextBlock.blockNumber}`, {
        state: {
          examMode
        }
      });
      return;
    }

    navigate('/exams/usmle/step3-pretest/exam');
  };

  const breakMinutes = String(Math.floor(Math.max(breakSecondsRemaining, 0) / 60)).padStart(2, '0');
  const breakSeconds = String(Math.max(breakSecondsRemaining, 0) % 60).padStart(2, '0');
  const getAnsweredCount = () => {
    if (!blockQuestions || blockQuestions.length === 0) return 0;
    return blockQuestions.reduce((count, _, index) => {
      const key = `${dayKey}-${blockNumber}-${index}`;
      return count + (answers[key] !== undefined ? 1 : 0);
    }, 0);
  };
  const isEndOfDayOneProfessional =
    examMode === 'professional' &&
    (dayKey === 'DAY_1') &&
    Number(blockNumber) === 6;
  const isEndOfDayTwoProfessional =
    examMode === 'professional' &&
    (dayKey === 'DAY_2') &&
    Number(blockNumber) === 6;

  if (loading) {
    return <div className="plab1-test-loading">Loading Step 3 block...</div>;
  }

  if (error) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <div className="plab1-test-error">{error}</div>
          <button className="review-primary" onClick={handleReturnToBlocks}>
            Back to Blocks
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blockQuestions.length) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <div className="plab1-test-error">No questions available for this block.</div>
          <button className="review-primary" onClick={handleReturnToBlocks}>
            Back to Blocks
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (isBreakActive) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper usmle-step3-exam-wrapper">
          <h1>{test?.title || 'USMLE Step 3 Pre-Test'}</h1>
          <p className="admin-tests-subtitle" style={{ marginBottom: '1rem' }}>
            Break in progress for {DAY_LABELS[dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1']} | Block {blockNumber}
          </p>

          <section className="review-score-highlight" style={{ marginBottom: '2rem' }}>
            <div className="exam-timer-row">
              <div className="timer-circle minutes">
                <div className="timer-value">{breakMinutes}</div>
                <div className="timer-label">MINUTES</div>
              </div>

              <div className="timer-circle seconds">
                <div className="timer-value">{breakSeconds}</div>
                <div className="timer-label">SECONDS</div>
              </div>

              <div className="timer-circle answered">
                <div className="timer-value">{getAnsweredCount()}</div>
                <div className="timer-label">ANSWERED</div>
              </div>
            </div>

            <p className="review-score-subtext">You can navigate other pages and return later. Your place is saved.</p>
          </section>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="amc-step1-exam-btn primary"
              onClick={startNextBlock}
              style={{ minWidth: '160px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              Start Exam
            </button>
            <button
              type="button"
              className="amc-step1-exam-btn primary"
              onClick={handleReturnToBlocks}
              style={{ minWidth: '160px' }}
            >
              Back to Blocks
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Review Mode - Show Score and All Questions with Explanations
  if (isReviewMode) {
    const score = calculateScore();
    const performanceLevel = 
      score.percentage >= 80 ? 'Excellent' : 
      score.percentage >= 70 ? 'Good' : 
      score.percentage >= 60 ? 'Fair' : 'Needs Improvement';
    
    const performanceColor =
      score.percentage >= 80 ? '#16a34a' :
      score.percentage >= 70 ? '#0ea5e9' :
      score.percentage >= 60 ? '#f59e0b' : '#dc2626';

    // Filter questions based on review mode
    const questionsToDisplay = blockQuestions.filter((question, index) => {
      if (reviewFilter === 'all') {
        return true;
      }
      // incorrect mode - show only questions that were answered incorrectly or not answered
      const answerKey = `${dayKey}-${blockNumber}-${index}`;
      const userAnswer = answers[answerKey];
      return userAnswer !== question.correctOption;
    });

    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper usmle-step3-exam-wrapper">
          <h1>{test?.title || 'USMLE Step 3 Pre-Test'}</h1>
          <p className="admin-tests-subtitle" style={{ marginBottom: '1rem' }}>
            {DAY_LABELS[dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1']} | Block {blockNumber} - Review
          </p>

          {/* Score Card */}
          <section className="review-score-highlight" style={{ marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="review-score-label">Your Score</p>
              <p
                className="review-score-main"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: '800',
                  color: performanceColor,
                  margin: '0.5rem 0'
                }}
              >
                {score.percentage}%
              </p>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: performanceColor, margin: '0.5rem 0' }}>
                {performanceLevel}
              </p>
              <p className="review-score-subtext">
                {score.correct} out of {score.total} questions correct
              </p>
            </div>
          </section>

          {/* Review Filter Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              className={`amc-step1-exam-btn ${reviewFilter === 'all' ? 'primary' : ''}`}
              onClick={() => setReviewFilter('all')}
              style={{
                backgroundColor: reviewFilter === 'all' ? '#1d4ed8' : '#e5e7eb',
                color: reviewFilter === 'all' ? '#ffffff' : '#0f172a',
                fontWeight: '600'
              }}
            >
              All Questions ({blockQuestions.length})
            </button>
            <button
              type="button"
              className={`amc-step1-exam-btn ${reviewFilter === 'incorrect' ? 'primary' : ''}`}
              onClick={() => setReviewFilter('incorrect')}
              style={{
                backgroundColor: reviewFilter === 'incorrect' ? '#dc2626' : '#e5e7eb',
                color: reviewFilter === 'incorrect' ? '#ffffff' : '#0f172a',
                fontWeight: '600'
              }}
            >
              Incorrect Only ({blockQuestions.length - score.correct})
            </button>
          </div>

          {/* All Questions Review */}
          <div style={{ marginTop: '2rem' }}>
            {questionsToDisplay.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <p style={{ fontSize: '1.1rem', margin: '0' }}>No questions to display in this view.</p>
              </div>
            ) : (
              questionsToDisplay.map((question, displayIndex) => {
                const originalIndex = blockQuestions.indexOf(question);
                const answerKey = `${dayKey}-${blockNumber}-${originalIndex}`;
                const userAnswer = answers[answerKey];
                const isCorrect = userAnswer === question.correctOption;
                const isAnswered = userAnswer !== undefined;

                return (
                  <div
                    key={originalIndex}
                    className="review-question-card"
                    style={{
                      marginBottom: '2rem',
                      border: isCorrect ? '2px solid #16a34a' : isAnswered ? '2px solid #dc2626' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="block-card-topline" style={{ padding: '1rem', backgroundColor: isCorrect ? '#f0fdf4' : isAnswered ? '#fef2f2' : '#f9fafb' }}>
                      <span className="block-card-title" style={{ color: isCorrect ? '#16a34a' : isAnswered ? '#dc2626' : '#0f172a' }}>
                        Question {originalIndex + 1}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isCorrect ? '#16a34a' : isAnswered ? '#dc2626' : '#64748b' }}>
                        {isCorrect ? '✓ Correct' : isAnswered ? '✗ Incorrect' : 'Not Answered'}
                      </span>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#0f172a' }}>{question.questionText}</h3>

                      <ul className="review-option-list">
                        {(question.options || []).map((option) => {
                          const isUserAnswer = option.key === userAnswer;
                          const isCorrectAnswer = option.key === question.correctOption;

                          return (
                            <li key={option.key}>
                              <div
                                style={{
                                  padding: '12px 14px',
                                  margin: '8px 0',
                                  border:
                                    isCorrectAnswer
                                      ? '2px solid #16a34a'
                                      : isUserAnswer && !isCorrectAnswer
                                        ? '2px solid #dc2626'
                                        : '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  backgroundColor:
                                    isCorrectAnswer
                                      ? '#f0fdf4'
                                      : isUserAnswer && !isCorrectAnswer
                                        ? '#fef2f2'
                                        : '#ffffff',
                                  color:
                                    isCorrectAnswer
                                      ? '#15803d'
                                      : isUserAnswer && !isCorrectAnswer
                                        ? '#991b1b'
                                        : '#334155',
                                  fontWeight: isUserAnswer || isCorrectAnswer ? '600' : '500'
                                }}
                              >
                                <span>{option.key}. {option.text}</span>
                                {isCorrectAnswer && <span style={{ marginLeft: '8px', fontWeight: '700' }}>✓ Correct</span>}
                                {isUserAnswer && !isCorrectAnswer && <span style={{ marginLeft: '8px', fontWeight: '700' }}>✗ Your answer</span>}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      {question.explanation && (
                        <div className="review-explanation" style={{ marginTop: '1.5rem' }}>
                          <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Explanation:</strong>
                          <div
                            className="review-explanation-content"
                            style={{ marginTop: '0.75rem', color: '#334155', lineHeight: '1.6' }}
                            dangerouslySetInnerHTML={{ __html: sanitizeExplanationHtml(question.explanation) }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Review actions vary by mode */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '2rem',
              marginBottom: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            {examMode === 'free' && (
              <button
                type="button"
                className="amc-step1-exam-btn"
                onClick={handleReattemptCurrentBlock}
                style={{ minWidth: '170px', backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
              >
                Reattempt Block
              </button>
            )}
            {isEndOfDayTwoProfessional ? (
              <>
                <button
                  type="button"
                  className="amc-step1-exam-btn primary"
                  onClick={handleFinishDayTwoExam}
                  style={{ minWidth: '160px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                >
                  Finish Day 2 Exam
                </button>
                <button
                  type="button"
                  className="amc-step1-exam-btn"
                  onClick={handleReattemptDayTwoExam}
                  style={{ minWidth: '170px' }}
                >
                  Reattempt Exam
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="amc-step1-exam-btn primary"
                  onClick={isEndOfDayOneProfessional ? handleOpenFinishDayOneConfirm : startNextBlock}
                  style={{ minWidth: '160px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                >
                  {isEndOfDayOneProfessional ? 'Finish Day 1 Exam' : 'Start Next Block'}
                </button>
                {examMode === 'free' ? (
                  <button
                    type="button"
                    className="amc-step1-exam-btn"
                    onClick={() => navigate('/exams/usmle/step3-pretest/exam')}
                    style={{ minWidth: '170px' }}
                  >
                    Back to Block Page
                  </button>
                ) : !isEndOfDayOneProfessional ? (
                  <button
                    type="button"
                    className="amc-step1-exam-btn"
                    onClick={handleGoToBreak}
                    style={{ minWidth: '140px', backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }}
                  >
                    Go to Break
                  </button>
                ) : null}
              </>
            )}
          </div>

          {finishDayOneConfirmOpen && (
            <div className="admin-tests-confirm-overlay" role="presentation" onClick={handleCancelFinishDayOneConfirm}>
              <section
                className="admin-tests-confirm-card publish"
                role="dialog"
                aria-modal="true"
                aria-labelledby="step3-finish-day1-confirm-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 id="step3-finish-day1-confirm-title">Finish Day 1 Exam?</h3>
                <p>
                  You are about to finish Day 1 and return to the Step 3 blocks page.
                </p>

                <div className="admin-tests-confirm-actions">
                  <button
                    type="button"
                    className="admin-tests-confirm-cancel"
                    onClick={handleCancelFinishDayOneConfirm}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="admin-tests-confirm-ok"
                    onClick={handleConfirmFinishDayOneExam}
                  >
                    Finish Day 1
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Question Mode - Show Current Question
  return (
    <div className="plab1-test-page">
      <Header />
      <main className="plab1-test-wrapper usmle-step3-exam-wrapper">
        <h1>{test?.title || 'USMLE Step 3 Pre-Test'}</h1>
        <p className="admin-tests-subtitle" style={{ marginBottom: '1rem' }}>
          {DAY_LABELS[dayKey === 'DAY_2' ? 'DAY_2' : 'DAY_1']} | Block {blockNumber}
        </p>

        <section className="review-score-highlight">
          <div className="exam-timer-row">
            <div className="timer-circle minutes">
              <div className="timer-value">{String(Math.floor(timeRemaining / 60)).padStart(2, '0')}</div>
              <div className="timer-label">MINUTES</div>
            </div>

            <div className="timer-circle seconds">
              <div className="timer-value">{String(timeRemaining % 60).padStart(2, '0')}</div>
              <div className="timer-label">SECONDS</div>
            </div>

            <div className="timer-circle answered">
              <div className="timer-value">{getAnsweredCount()}</div>
              <div className="timer-label">ANSWERED</div>
            </div>
          </div>

          <p className="review-score-subtext">Question {questionIndex + 1} of {blockQuestions.length}</p>
        </section>

        <section className="review-question-card" style={{ marginTop: '1.25rem' }}>
          <div className="block-card-topline">
            <span className="block-card-title">Question {questionIndex + 1} of {blockQuestions.length}</span>
            <span className="block-card-state">{dayKey === 'DAY_2' ? 'Day 2' : 'Day 1'}</span>
          </div>

          {currentQuestion && (
            <>
              <h3 style={{ marginTop: '0.9rem' }}>{currentQuestion.questionText}</h3>
              <ul className="review-option-list">
                {(currentQuestion.options || []).map((option) => {
                  const selected = answers[currentAnswerKey] === option.key;

                  return (
                    <li key={option.key}>
                      <button
                        type="button"
                        className={`usmle-step3-option ${selected ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(option.key)}
                      >
                        <span className="review-option-text">{option.key}. {option.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Only Previous and Next/Finish Buttons */}
              <div className="question-actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="amc-step1-exam-btn primary"
                  onClick={() => setQuestionIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={questionIndex === 0}
                >
                  Previous
                </button>
                {questionIndex < blockQuestions.length - 1 ? (
                  <button
                    type="button"
                    className="amc-step1-exam-btn primary"
                    onClick={() => setQuestionIndex((prev) => Math.min(prev + 1, blockQuestions.length - 1))}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="amc-step1-exam-btn primary"
                    onClick={handleFinishBlock}
                    style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  >
                    Finish & Review
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {finishConfirmOpen && (
        <div className="admin-tests-confirm-overlay" role="presentation" onClick={handleCancelFinishBlock}>
          <section
            className="admin-tests-confirm-card publish"
            role="dialog"
            aria-modal="true"
            aria-labelledby="step3-finish-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="step3-finish-confirm-title">Finish and review this block?</h3>
            <p>Once you finish, this block will move to review mode and the next block can be started.</p>

            <div className="admin-tests-confirm-actions">
              <button type="button" className="admin-tests-confirm-cancel" onClick={handleCancelFinishBlock}>
                Cancel
              </button>
              <button type="button" className="admin-tests-confirm-ok" onClick={handleConfirmFinishBlock}>
                Finish & Review
              </button>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default USMLEStep3BlockExam;
