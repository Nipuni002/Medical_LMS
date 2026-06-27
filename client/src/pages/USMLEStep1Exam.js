import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../config/api';
import './PLAB1Test.css';
import './USMLEStep1Exam.css';

const BLOCK_COUNT = 7;
const BLOCK_SECONDS = 60 * 60;
const TOTAL_BREAK_SECONDS = 45 * 60;
const USMLE_PRETEST_PROGRESS_KEY = 'usmle-step1-pretest-progress';
const USMLE_PRETEST_COMPLETED_KEY = 'usmle-step1-pretest-completed';
const USMLE_PRETEST_MODE_KEY = 'usmle-step1-pretest-exam-mode';

function USMLEStep1Exam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [phase, setPhase] = useState('instructions');
  const [currentBlock, setCurrentBlock] = useState(1);
  const [completedBlocksFree, setCompletedBlocksFree] = useState([]);
  const [completedBlocksProfessional, setCompletedBlocksProfessional] = useState([]);
  const [questionIndexInBlock, setQuestionIndexInBlock] = useState(0);
  const [blockRemainingSeconds, setBlockRemainingSeconds] = useState(BLOCK_SECONDS);
  const [totalBreakRemainingSeconds, setTotalBreakRemainingSeconds] = useState(TOTAL_BREAK_SECONDS);
  const [answers, setAnswers] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [reviewMode, setReviewMode] = useState('all');
  const [hasCompletedAttempt, setHasCompletedAttempt] = useState(false);
  const [showNavigationLockModal, setShowNavigationLockModal] = useState(false);
  const [examMode, setExamMode] = useState('professional');

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/plab-tests/usmle-step1-pretest`);
        const data = await response.json();

        if (!data.success || !data.data) {
          setError('USMLE Step 1 pre-test is not available right now.');
          setLoading(false);
          return;
        }

        const loadedTest = data.data;
        loadedTest.questions = [...(loadedTest.questions || [])].sort((a, b) => {
          const blockA = Number(a.blockNumber) || 1;
          const blockB = Number(b.blockNumber) || 1;
          if (blockA !== blockB) {
            return blockA - blockB;
          }
          return (a.order || 0) - (b.order || 0);
        });

        setTest(loadedTest);
      } catch (fetchError) {
        console.error('Error fetching USMLE pre-test:', fetchError);
        setError('Unable to load pre-test questions right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, []);

  const questionsByBlock = useMemo(() => {
    const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

    (test?.questions || []).forEach((question) => {
      const block = Number(question.blockNumber) || 1;
      if (grouped[block]) {
        grouped[block].push(question);
      }
    });

    return grouped;
  }, [test]);

  const totalQuestions = useMemo(() => (test?.questions || []).length, [test]);

  const getGlobalIndex = (block, indexInBlock) => {
    let count = 0;
    for (let b = 1; b < block; b += 1) {
      count += (questionsByBlock[b] || []).length;
    }
    return count + indexInBlock;
  };

  const currentBlockQuestions = questionsByBlock[currentBlock] || [];
  const currentQuestion = currentBlockQuestions[questionIndexInBlock] || null;
  const currentGlobalIndex = getGlobalIndex(currentBlock, questionIndexInBlock);
  const isLastQuestionInBlock = questionIndexInBlock >= currentBlockQuestions.length - 1;
  const currentBlockAnsweredCount = currentBlockQuestions.reduce((count, _question, index) => {
    const globalIndex = getGlobalIndex(currentBlock, index);
    return answers[globalIndex] ? count + 1 : count;
  }, 0);
  const currentBlockIncompleteCount = Math.max(currentBlockQuestions.length - currentBlockAnsweredCount, 0);

  useEffect(() => {
    const completedFlag = localStorage.getItem(USMLE_PRETEST_COMPLETED_KEY) === 'true';
    setHasCompletedAttempt(completedFlag);

    const savedExamMode = localStorage.getItem(USMLE_PRETEST_MODE_KEY);
    if (savedExamMode === 'free' || savedExamMode === 'professional') {
      setExamMode(savedExamMode);
    }

    if (completedFlag) {
      return;
    }

    const savedProgressRaw = localStorage.getItem(USMLE_PRETEST_PROGRESS_KEY);
    if (!savedProgressRaw) {
      return;
    }

    try {
      const savedProgress = JSON.parse(savedProgressRaw);
      const now = Date.now();
      const savedAt = Number(savedProgress.savedAt) || now;
      const elapsedSeconds = Math.max(0, Math.floor((now - savedAt) / 1000));

      const savedPhase = savedProgress.phase || 'instructions';
      const savedCurrentBlock = Math.min(
        BLOCK_COUNT,
        Math.max(1, Number(savedProgress.currentBlock) || 1)
      );
      const savedQuestionIndexInBlock = Math.max(0, Number(savedProgress.questionIndexInBlock) || 0);
      const savedCompletedBlocks = Array.isArray(savedProgress.completedBlocks)
        ? savedProgress.completedBlocks
          .map((value) => Number(value))
          .filter((value) => value >= 1 && value <= BLOCK_COUNT)
        : [];

      const savedCompletedBlocksFree = Array.isArray(savedProgress.completedBlocksFree)
        ? savedProgress.completedBlocksFree.map((value) => Number(value)).filter((value) => value >= 1 && value <= BLOCK_COUNT)
        : savedCompletedBlocks;

      const savedCompletedBlocksProfessional = Array.isArray(savedProgress.completedBlocksProfessional)
        ? savedProgress.completedBlocksProfessional.map((value) => Number(value)).filter((value) => value >= 1 && value <= BLOCK_COUNT)
        : savedCompletedBlocks;

      const savedAnswers = savedProgress.answers && typeof savedProgress.answers === 'object'
        ? savedProgress.answers
        : {};

      const savedBlockRemaining = Math.max(0, Number(savedProgress.blockRemainingSeconds) || BLOCK_SECONDS);
      const savedBreakRemaining = Math.max(0, Number(savedProgress.totalBreakRemainingSeconds) || TOTAL_BREAK_SECONDS);

      const resumedBlockRemaining = savedPhase === 'block'
        ? Math.max(savedBlockRemaining - elapsedSeconds, 0)
        : savedBlockRemaining;
      const resumedBreakRemaining = savedPhase === 'break'
        ? Math.max(savedBreakRemaining - elapsedSeconds, 0)
        : savedBreakRemaining;

      setPhase(savedPhase);
      setCurrentBlock(savedCurrentBlock);
      setQuestionIndexInBlock(savedQuestionIndexInBlock);
      setCompletedBlocksFree(savedCompletedBlocksFree);
      setCompletedBlocksProfessional(savedCompletedBlocksProfessional);
      setAnswers(savedAnswers);
      setBlockRemainingSeconds(resumedBlockRemaining);
      setTotalBreakRemainingSeconds(resumedBreakRemaining);
    } catch (storageError) {
      console.error('Unable to restore USMLE pre-test progress:', storageError);
      localStorage.removeItem(USMLE_PRETEST_PROGRESS_KEY);
    }
  }, []);

  useEffect(() => {
    if (loading || hasCompletedAttempt || !test) {
      return;
    }

    const progressPayload = {
      phase,
      currentBlock,
      completedBlocksFree,
      completedBlocksProfessional,
      questionIndexInBlock,
      blockRemainingSeconds,
      totalBreakRemainingSeconds,
      answers,
      savedAt: Date.now()
    };

    localStorage.setItem(USMLE_PRETEST_PROGRESS_KEY, JSON.stringify(progressPayload));
    localStorage.setItem(USMLE_PRETEST_MODE_KEY, examMode);
  }, [
    loading,
    hasCompletedAttempt,
    test,
    phase,
    currentBlock,
    completedBlocksFree,
    completedBlocksProfessional,
    questionIndexInBlock,
    blockRemainingSeconds,
    totalBreakRemainingSeconds,
    answers,
    examMode
  ]);

  useEffect(() => {
    if (phase !== 'block') {
      return undefined;
    }

    if (blockRemainingSeconds <= 0) {
      handleSubmitCurrentBlock();
      return undefined;
    }

    const timer = setInterval(() => {
      setBlockRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, blockRemainingSeconds]);

  useEffect(() => {
    if (phase !== 'break') {
      return undefined;
    }

    if (totalBreakRemainingSeconds <= 0) {
      handleStartNextBlock();
      return undefined;
    }

    const timer = setInterval(() => {
      setTotalBreakRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, totalBreakRemainingSeconds]);

  const markCurrentBlockComplete = () => {
    if (examMode === 'professional') {
      setCompletedBlocksProfessional((prev) => {
        if (prev.includes(currentBlock)) {
          return prev;
        }
        return [...prev, currentBlock].sort((a, b) => a - b);
      });
    } else {
      setCompletedBlocksFree((prev) => {
        if (prev.includes(currentBlock)) {
          return prev;
        }
        return [...prev, currentBlock].sort((a, b) => a - b);
      });
    }
  };

  const highestUnlockedBlock = useMemo(() => {
    if (examMode === 'free') {
      return BLOCK_COUNT;
    }

    const maxCompleted = completedBlocksProfessional.length > 0 ? Math.max(...completedBlocksProfessional) : 0;
    return Math.min(BLOCK_COUNT, Math.max(1, maxCompleted + 1));
  }, [completedBlocksProfessional, examMode]);

  const startSpecificBlock = (blockNumber) => {
    if (blockNumber < 1 || blockNumber > BLOCK_COUNT) {
      return;
    }

    if (examMode !== 'free' && blockNumber > highestUnlockedBlock) {
      return;
    }

    setCurrentBlock(blockNumber);
    setPhase('block');
    setQuestionIndexInBlock(0);
    setBlockRemainingSeconds(BLOCK_SECONDS);
  };

  const handleSelectOption = (optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [currentGlobalIndex]: optionKey
    }));
  };

  const handleNextQuestion = () => {
    if (questionIndexInBlock < currentBlockQuestions.length - 1) {
      setQuestionIndexInBlock((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (questionIndexInBlock > 0) {
      setQuestionIndexInBlock((prev) => prev - 1);
    }
  };

  const finishExam = () => {
    localStorage.setItem(USMLE_PRETEST_COMPLETED_KEY, 'true');
    localStorage.removeItem(USMLE_PRETEST_PROGRESS_KEY);
    setHasCompletedAttempt(true);

    navigate('/exams/usmle/step1-pretest/review', {
      state: {
        test,
        answers
      }
    });
  };

  const handleStartNextBlock = () => {
    if (currentBlock >= BLOCK_COUNT) {
      finishExam();
      return;
    }

    const nextBlock = currentBlock + 1;
    setCurrentBlock(nextBlock);
    setPhase('block');
    setQuestionIndexInBlock(0);
    setBlockRemainingSeconds(BLOCK_SECONDS);
  };

  const handleSubmitCurrentBlock = () => {
    setShowSubmitConfirm(false);
    setReviewMode('all');
    markCurrentBlockComplete();
    setPhase('review');
  };

  const handleConfirmSubmitCurrentBlock = () => {
    setShowSubmitConfirm(true);
  };

  const handleCancelSubmitCurrentBlock = () => {
    setShowSubmitConfirm(false);
  };

  const handleGoToQuestionInBlock = (indexInBlock) => {
    if (indexInBlock < 0 || indexInBlock >= currentBlockQuestions.length) {
      return;
    }

    setQuestionIndexInBlock(indexInBlock);
  };

  const handleReattemptAllBlocks = () => {
    localStorage.removeItem(USMLE_PRETEST_COMPLETED_KEY);
    localStorage.removeItem(USMLE_PRETEST_PROGRESS_KEY);

    setHasCompletedAttempt(false);
    setPhase('instructions');
    setCurrentBlock(1);
    setCompletedBlocksFree([]);
    setCompletedBlocksProfessional([]);
    setQuestionIndexInBlock(0);
    setBlockRemainingSeconds(BLOCK_SECONDS);
    setTotalBreakRemainingSeconds(TOTAL_BREAK_SECONDS);
    setAnswers({});
    setShowSubmitConfirm(false);
    setReviewMode('all');
  };

  const handleReattemptCurrentBlock = () => {
    // Clear answers for the current block and reopen the block for attempt
    setAnswers((prev) => {
      const next = { ...prev };
      const blockQuestions = questionsByBlock[currentBlock] || [];
      blockQuestions.forEach((_q, idx) => {
        const globalIndex = getGlobalIndex(currentBlock, idx);
        if (next.hasOwnProperty(globalIndex)) {
          delete next[globalIndex];
        }
      });
      return next;
    });

    if (examMode === 'professional') {
      setCompletedBlocksProfessional((prev) => prev.filter((b) => b !== currentBlock));
    } else {
      setCompletedBlocksFree((prev) => prev.filter((b) => b !== currentBlock));
    }
    setPhase('block');
    setQuestionIndexInBlock(0);
    setBlockRemainingSeconds(BLOCK_SECONDS);
    setShowSubmitConfirm(false);
    setReviewMode('all');
  };

  const handleSelectExamMode = (mode) => {
    setExamMode(mode);
    localStorage.setItem(USMLE_PRETEST_MODE_KEY, mode);
  };

  const handleContinueNextBlock = () => {
    if (currentBlock >= BLOCK_COUNT) {
      finishExam();
      return;
    }

    handleStartNextBlock();
  };

  const handleGoToBreak = () => {
    if (currentBlock >= BLOCK_COUNT) {
      finishExam();
      return;
    }

    if (totalBreakRemainingSeconds <= 0) {
      handleStartNextBlock();
      return;
    }

    setPhase('break');
  };

  const currentBlockReviewData = useMemo(() => {
    return currentBlockQuestions.map((question, index) => {
      const globalIndex = getGlobalIndex(currentBlock, index);
      const selectedAnswer = answers[globalIndex];
      const isCorrect = selectedAnswer === question.correctOption;

      return {
        question,
        index,
        globalIndex,
        selectedAnswer,
        isCorrect
      };
    });
  }, [currentBlockQuestions, currentBlock, answers]);

  const filteredReviewData = useMemo(() => {
    if (reviewMode === 'incorrect') {
      return currentBlockReviewData.filter((item) => !item.isCorrect);
    }

    return currentBlockReviewData;
  }, [currentBlockReviewData, reviewMode]);

  const currentBlockScore = useMemo(() => {
    return currentBlockReviewData.reduce((total, item) => total + (item.isCorrect ? 1 : 0), 0);
  }, [currentBlockReviewData]);

  const currentBlockTotal = currentBlockReviewData.length;
  const currentBlockPercent = Math.round((currentBlockScore / Math.max(currentBlockTotal, 1)) * 100);

  const answeredCount = Object.keys(answers).length;
  const isNavigationLocked = false;

  const showNavigationLockNotice = () => {
    setShowNavigationLockModal(true);
  };

  const handleHeaderInteractionCapture = (event) => {
    if (!isNavigationLocked) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    showNavigationLockNotice();
  };

  useEffect(() => {
    if (!showNavigationLockModal) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowNavigationLockModal(false);
    }, 2600);

    return () => clearTimeout(timer);
  }, [showNavigationLockModal]);

  useEffect(() => {
    if (!isNavigationLocked) {
      return undefined;
    }

    const lockCurrentLocation = () => {
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.history.pushState({ examLock: true }, '', currentUrl);
    };

    lockCurrentLocation();

    const handlePopState = () => {
      lockCurrentLocation();
      showNavigationLockNotice();
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleDocumentClick = (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
        return;
      }

      if (anchor.hasAttribute('download') || anchor.target === '_blank') {
        return;
      }

      const targetUrl = new URL(anchor.href, window.location.origin);
      const currentUrl = new URL(window.location.href);
      const isSamePage =
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        targetUrl.hash === currentUrl.hash;

      if (isSamePage) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      showNavigationLockNotice();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isNavigationLocked]);

  const timerMinutes = String(Math.floor(Math.max(blockRemainingSeconds, 0) / 60)).padStart(2, '0');
  const timerSeconds = String(Math.max(blockRemainingSeconds, 0) % 60).padStart(2, '0');
  const breakMinutes = String(Math.floor(Math.max(totalBreakRemainingSeconds, 0) / 60)).padStart(2, '0');
  const breakSeconds = String(Math.max(totalBreakRemainingSeconds, 0) % 60).padStart(2, '0');

  if (loading) {
    return (
      <div className="plab1-test-page">
        <Header />
        <div className="plab1-test-loading">Loading USMLE Step 1 pre-test...</div>
        <Footer />
      </div>
    );
  }

  if (error || !test || totalQuestions === 0) {
    return (
      <div className="plab1-test-page">
        <Header />
        <div className="plab1-test-error">{error || 'No questions available.'}</div>
        <Footer />
      </div>
    );
  }

  if (hasCompletedAttempt) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <h1>{test.title || 'USMLE Step 1 Pre-Test'}</h1>
          <section className="exam-instruction-card">
            <h2>Attempt Completed</h2>
            <p className="plab1-test-instructions">
              You have already completed this USMLE pre-test attempt. Restarting from the beginning is not allowed.
            </p>
            <button type="button" className="start-exam-btn" onClick={handleReattemptAllBlocks}>
              Reattempt 7 Blocks
            </button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="plab1-test-page">
      <div className={`exam-header-lock-zone ${isNavigationLocked ? 'is-locked' : ''}`} onClickCapture={handleHeaderInteractionCapture}>
        <Header />
      </div>

      <main className="plab1-test-wrapper">
        <h1>{test.title || 'USMLE Step 1 Pre-Test'}</h1>

        {phase === 'instructions' && (
          <>
            <section className="step1-mode-selector" aria-label="Select USMLE Step 1 exam mode">
              <div className="step1-mode-copy">
                <p className="step1-mode-kicker">Choose Exam Mode</p>
                <h2>Professional or free block access</h2>
                <p>
                  Professional mode unlocks one block at a time. Free mode opens all blocks so you can jump anywhere.
                </p>
              </div>

              <div className="step1-mode-actions">
                <button
                  type="button"
                  className={`step1-mode-btn ${examMode === 'professional' ? 'active' : ''}`}
                  onClick={() => handleSelectExamMode('professional')}
                >
                  Professional Way
                </button>
                <button
                  type="button"
                  className={`step1-mode-btn ${examMode === 'free' ? 'active' : ''}`}
                  onClick={() => handleSelectExamMode('free')}
                >
                  Free to Blocks
                </button>
              </div>
            </section>

            <section className="usmle-blocks-board" aria-label="USMLE Step 1 blocks">
              {[1, 2, 3, 4, 5, 6, 7].map((block) => {
                const isCompleted = examMode === 'free' && completedBlocksFree.includes(block);
                const isUnlocked = block <= highestUnlockedBlock;
                const isActive = phase !== 'instructions' && block === currentBlock;
                const blockStatus = isCompleted
                  ? 'Completed'
                  : examMode === 'free'
                    ? 'Open'
                    : isUnlocked
                      ? 'Unlocked'
                      : 'Locked';
                const blockDescription = isCompleted
                  ? 'Review complete for this block.'
                  : examMode === 'free'
                    ? 'All blocks are available in free mode.'
                    : isUnlocked
                    ? isActive
                      ? 'You are currently attempting this block.'
                      : 'Ready to start when you are prepared.'
                    : 'Complete the previous block to unlock this section.';

                return (
                  <button
                    key={block}
                    type="button"
                    className={`usmle-block-card ${isCompleted ? 'completed' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`}
                    onClick={() => startSpecificBlock(block)}
                    disabled={!isUnlocked}
                  >
                    <span className="block-card-topline">
                      <span className="block-card-title">Block {block}</span>
                      {!isUnlocked && <span className="block-lock-icon" aria-hidden="true" />}
                    </span>
                    <span className="block-card-state">{blockStatus}</span>
                    <span className="block-card-description">{blockDescription}</span>
                    <span className="block-card-meta">Up to 40 questions / 60 minutes</span>
                  </button>
                );
              })}
            </section>

            <section className="exam-instruction-card">
              <h2>Select a Block to Begin</h2>
              <p className="plab1-test-instructions">
                Click an unlocked block above to open the question page for that block.
              </p>
            </section>
          </>
        )}

        {phase === 'instructions' ? null : phase === 'break' ? (
          <section className="exam-instruction-card usmle-break-screen">
            <h2>Break Time</h2>
            <p className="plab1-test-instructions">
              Remaining overall break time across all blocks:
            </p>
            <div className="usmle-break-timer" aria-label="Overall break timer">
              {breakMinutes}:{breakSeconds}
            </div>
            <p className="plab1-test-instructions">
              When ready, you can start Block {Math.min(currentBlock + 1, BLOCK_COUNT)} immediately.
            </p>
            <button className="start-exam-btn" onClick={handleStartNextBlock}>
              Start Next Block Now
            </button>
          </section>
        ) : phase === 'review' ? (
          <section className="question-card question-list-card">
            <h2 className="usmle-block-review-title">Block {currentBlock} Review</h2>
            <section className="review-score-highlight" aria-label="Block Score Summary">
              <p className="review-score-label">Block {currentBlock} Score</p>
              <p className="review-score-main">{currentBlockScore}/{currentBlockTotal}</p>
              <p className="review-score-percentage">{currentBlockPercent}%</p>
            </section>

            <div className="review-actions">
              <button
                type="button"
                className={`review-action-btn ${reviewMode === 'all' ? 'active' : ''}`}
                onClick={() => setReviewMode('all')}
              >
                Review All Questions
              </button>
              <button
                type="button"
                className={`review-action-btn ${reviewMode === 'incorrect' ? 'active' : ''}`}
                onClick={() => setReviewMode('incorrect')}
              >
                Review Incorrect Questions
              </button>
            </div>

            {filteredReviewData.length === 0 && reviewMode === 'incorrect' && (
              <p className="review-empty-state">No incorrect questions in this block. Great work.</p>
            )}

            {filteredReviewData.map(({ question, index, selectedAnswer, isCorrect }) => (
              <article key={`${question._id || 'q'}-${index}`} className="review-question-card">
                <h3>
                  Q{index + 1}. {question.questionText}
                </h3>
                <p className={`review-result-badge ${isCorrect ? 'correct' : 'wrong'}`}>
                  {isCorrect ? 'You are correct' : 'Incorrect answer'}
                </p>
                <p className="review-answer-line">Your answer: {selectedAnswer || 'Not answered'}</p>
                <p className="review-answer-line">Correct answer: {question.correctOption}</p>

                <ul className="review-option-list">
                  {(question.options || []).map((option) => {
                    const optionIsCorrect = option.key === question.correctOption;
                    const optionIsSelected = selectedAnswer === option.key;

                    return (
                      <li key={option.key} className={`${optionIsCorrect ? 'correct' : ''} ${optionIsSelected && !optionIsCorrect ? 'wrong' : ''}`}>
                        <span className="review-option-text">{option.key}. {option.text}</span>
                      </li>
                    );
                  })}
                </ul>

                {question.explanation && (
                  <div className="review-explanation">
                    <strong>Explanation:</strong>
                    <div className="review-explanation-content" dangerouslySetInnerHTML={{ __html: question.explanation }} />
                  </div>
                )}

                {!question.explanation && (
                  <div className="review-explanation">
                    <strong>Explanation:</strong>
                    <div className="review-explanation-content">
                      <p>Explanation is not available for this question.</p>
                    </div>
                  </div>
                )}
              </article>
            ))}

            <div className="question-actions">
              {examMode === 'free' ? (
                <>
                  <button className="nav-btn secondary-btn" onClick={handleReattemptCurrentBlock}>
                    Reattempt Block
                  </button>
                  <button className="nav-btn secondary-btn" onClick={() => setPhase('instructions')}>
                    Back To Blocks Page
                  </button>
                  <button className="nav-btn end-test-btn" onClick={handleContinueNextBlock}>
                    {currentBlock < BLOCK_COUNT ? `Next Block ${currentBlock + 1}` : 'Finish Exam'}
                  </button>
                </>
              ) : (
                <>
                  {currentBlock < BLOCK_COUNT && totalBreakRemainingSeconds > 0 && (
                    <button className="nav-btn secondary-btn" onClick={handleGoToBreak}>
                      Go To Break ({breakMinutes}:{breakSeconds})
                    </button>
                  )}

                  <button className="nav-btn end-test-btn" onClick={handleContinueNextBlock}>
                    {currentBlock < BLOCK_COUNT ? `Next Block ${currentBlock + 1}` : 'Finish Exam'}
                  </button>
                </>
              )}
            </div>
          </section>
        ) : (
          <>
            <div className="plab1-test-timer-row">
              <div className="timer-badge">
                <span className="timer-value">{timerMinutes}</span>
                <span className="timer-label">MINUTES</span>
              </div>
              <div className="timer-badge">
                <span className="timer-value">{timerSeconds}</span>
                <span className="timer-label">SECONDS</span>
              </div>
              <div className="timer-badge timer-progress-badge">
                <span className="timer-value">{answeredCount}</span>
                <span className="timer-label">ANSWERED</span>
              </div>
            </div>

            <section className="question-layout-grid">
              <article className="question-card question-list-card">
                <p className="question-progress">
                  Block {currentBlock} | Question {questionIndexInBlock + 1} of {Math.max(currentBlockQuestions.length, 1)}
                </p>

                {currentQuestion ? (
                  <>
                    <p className="question-text">{currentQuestion.questionText}</p>

                    <div className="options-list">
                      {(currentQuestion.options || []).map((option) => (
                        <label key={option.key} className="option-item">
                          <input
                            type="radio"
                            name={`question-${currentGlobalIndex}`}
                            checked={answers[currentGlobalIndex] === option.key}
                            onChange={() => handleSelectOption(option.key)}
                          />
                          <span>{option.key}. {option.text}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="plab1-test-instructions">No questions in this block. Submit to continue.</p>
                )}

                <div className="question-actions">
                  <button className="nav-btn secondary-btn" onClick={handlePreviousQuestion} disabled={questionIndexInBlock === 0}>
                    Previous
                  </button>
                  {!isLastQuestionInBlock ? (
                    <button className="nav-btn next-btn" onClick={handleNextQuestion}>
                      Next
                    </button>
                  ) : (
                    <button className="nav-btn end-test-btn" onClick={handleConfirmSubmitCurrentBlock}>
                      Submit Block {currentBlock}
                    </button>
                  )}
                </div>
              </article>

              <aside className="question-status-panel">
                <h3>Question Pages</h3>

                <div className="status-summary-row">
                  <p className="status-summary complete-count">Completed: {currentBlockAnsweredCount}</p>
                  <p className="status-summary incomplete-count">Incomplete: {currentBlockIncompleteCount}</p>
                </div>

                <div className="question-number-grid">
                  {currentBlockQuestions.map((_question, indexInBlock) => {
                    const globalIndex = getGlobalIndex(currentBlock, indexInBlock);
                    const isCurrent = indexInBlock === questionIndexInBlock;
                    const isAnswered = Boolean(answers[globalIndex]);
                    const statusClass = isAnswered ? 'is-complete' : 'is-incomplete';

                    return (
                      <button
                        key={`block-${currentBlock}-question-${indexInBlock}`}
                        className={`question-number-btn ${statusClass} ${isCurrent ? 'is-current' : ''}`}
                        onClick={() => handleGoToQuestionInBlock(indexInBlock)}
                        type="button"
                      >
                        {indexInBlock + 1}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>

      {showSubmitConfirm && phase === 'block' && (
        <div className="submit-confirm-overlay" role="presentation" onClick={handleCancelSubmitCurrentBlock}>
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

            <h2 id="submit-confirm-title">Submit Block {currentBlock}?</h2>
            <p>
              You have completed <strong>{currentBlockAnsweredCount}</strong> out of{' '}
              <strong>{currentBlockQuestions.length}</strong> questions in this block.
            </p>
            <p className="submit-confirm-warning">
              {currentBlockIncompleteCount > 0
                ? `You still have ${currentBlockIncompleteCount} incomplete question${currentBlockIncompleteCount === 1 ? '' : 's'}.`
                : 'Great work. All questions in this block are completed.'}
            </p>

            <div className="submit-confirm-actions">
              <button type="button" className="submit-cancel-btn" onClick={handleCancelSubmitCurrentBlock}>
                Cancel
              </button>
              <button type="button" className="submit-confirm-btn" onClick={handleSubmitCurrentBlock}>
                Submit Block
              </button>
            </div>
          </section>
        </div>
      )}

      {showNavigationLockModal && (
        <div className="exam-nav-lock-overlay" role="presentation" onClick={() => setShowNavigationLockModal(false)}>
          <section
            className="exam-nav-lock-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="exam-nav-lock-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="exam-nav-lock-title">Exam in Progress</h2>
            <p>
              You cannot leave this exam now. Click "{examMode === 'free' ? 'Back To Blocks Page' : 'Go To Break'}" first.
            </p>
            <button
              type="button"
              className="exam-nav-lock-btn"
              onClick={() => setShowNavigationLockModal(false)}
            >
              Understood
            </button>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default USMLEStep1Exam;
