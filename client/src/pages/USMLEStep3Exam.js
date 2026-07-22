import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../config/api';
import './PLAB1Test.css';
import './USMLEStep1Exam.css';

const DAY_LABELS = {
  DAY_1: 'Day 1 - Foundations of Independent Practice (FIP)',
  DAY_2: 'Day 2 - Advanced Clinical Medicine (ACM)'
};

const DAY_ORDER = {
  DAY_1: 1,
  DAY_2: 2
};

const DAY_KEYS = ['DAY_1', 'DAY_2'];
const BLOCK_COUNT_PER_DAY = 6;
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

  DAY_KEYS.forEach((dayKey) => {
    const blocks = value[dayKey];
    if (!blocks) {
      return;
    }

    if (Array.isArray(blocks)) {
      blocks.forEach((blockNumber) => {
        const numericBlock = Number(blockNumber);
        if (Number.isFinite(numericBlock) && numericBlock >= 1 && numericBlock <= BLOCK_COUNT_PER_DAY) {
          normalizedStore[dayKey][numericBlock] = { completedAt: null, contentSignature: '' };
        }
      });
      return;
    }

    Object.entries(blocks).forEach(([blockNumber, blockState]) => {
      const numericBlock = Number(blockNumber);
      if (!Number.isFinite(numericBlock) || numericBlock < 1 || numericBlock > BLOCK_COUNT_PER_DAY) {
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

const getStep3BlockSignature = (blockQuestions) =>
  JSON.stringify(
    (blockQuestions || []).map((question) => ({
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

const resolveBreakResumeTarget = (breakSession) => {
  const fallbackTarget = getNextStep3Block(breakSession?.dayKey, breakSession?.blockNumber);
  const resolvedDayKey = breakSession?.nextDayKey || fallbackTarget?.dayKey || breakSession?.dayKey || null;
  const resolvedBlockNumber = Number(breakSession?.nextBlockNumber) || fallbackTarget?.blockNumber || null;

  if (!resolvedDayKey || !resolvedBlockNumber || resolvedBlockNumber < 1 || resolvedBlockNumber > 6) {
    return null;
  }

  return {
    dayKey: resolvedDayKey,
    blockNumber: resolvedBlockNumber
  };
};

function USMLEStep3Exam() {
  const navigate = useNavigate();
  const [examMode, setExamMode] = useState(() => {
    const savedMode = localStorage.getItem(STEP3_MODE_KEY);
    return savedMode === 'free' || savedMode === 'professional' ? savedMode : 'professional';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [completedBlocks, setCompletedBlocks] = useState({ DAY_1: {}, DAY_2: {} });
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(STEP3_BREAK_SECONDS);
  const [breakSession, setBreakSession] = useState(null);

  // Do not clear stored completed blocks on mount - keep user progress persisted.

  useEffect(() => {
    localStorage.setItem(STEP3_MODE_KEY, examMode);
  }, [examMode]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/plab-tests/usmle-step3-pretest`);
        const data = await response.json();

        console.log('USMLE Step 3 Exam fetch response:', { status: response.status, data });

        if (!data.success || !data.data) {
          setError(`USMLE Step 3 pre-test is not available right now. (${data.error || 'No data'})`);
          console.error('Test fetch failed:', data.error);
          return;
        }

        const loadedTest = data.data;
        loadedTest.questions = [...(loadedTest.questions || [])].sort((a, b) => {
          const dayA = DAY_ORDER[a.examDay] || 1;
          const dayB = DAY_ORDER[b.examDay] || 1;
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

        const savedCompletedBlocksRaw = localStorage.getItem(getStep3CompletedBlocksKey());
        if (savedCompletedBlocksRaw) {
          try {
            const savedCompletedBlocks = JSON.parse(savedCompletedBlocksRaw);
            setCompletedBlocks(normalizeStep3BlockCompletionStore(savedCompletedBlocks));
          } catch (storageError) {
            console.error('Unable to restore Step 3 completed blocks:', storageError);
            localStorage.removeItem(getStep3CompletedBlocksKey());
            setCompletedBlocks({ DAY_1: {}, DAY_2: {} });
          }
        } else {
          setCompletedBlocks({ DAY_1: {}, DAY_2: {} });
        }

        try {
          const savedBreakRaw = localStorage.getItem(getStep3BreakKey(examMode));
          if (savedBreakRaw) {
            const savedBreak = JSON.parse(savedBreakRaw);
            if (Number.isFinite(Number(savedBreak.breakEndsAt))) {
              const remaining = Math.max(0, Math.ceil((Number(savedBreak.breakEndsAt) - Date.now()) / 1000));
              if (remaining > 0) {
                const normalizedTarget = resolveBreakResumeTarget(savedBreak);
                setIsBreakActive(true);
                setBreakSecondsRemaining(remaining);
                setBreakSession({
                  ...savedBreak,
                  ...normalizedTarget
                });
              } else {
                localStorage.removeItem(getStep3BreakKey(examMode));
              }
            }
          } else {
            setIsBreakActive(false);
            setBreakSecondsRemaining(STEP3_BREAK_SECONDS);
            setBreakSession(null);
          }
        } catch (breakError) {
          console.error('Unable to restore Step 3 break session:', breakError);
          localStorage.removeItem(getStep3BreakKey(examMode));
          setIsBreakActive(false);
          setBreakSecondsRemaining(STEP3_BREAK_SECONDS);
          setBreakSession(null);
        }
      } catch (fetchError) {
        console.error('Error fetching USMLE Step 3 pre-test:', fetchError);
        setError('Unable to load Step 3 questions right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [examMode]);

  useEffect(() => {
    if (!test) {
      return;
    }

    localStorage.setItem(getStep3CompletedBlocksKey(), JSON.stringify(completedBlocks));
  }, [completedBlocks, test, examMode]);

  useEffect(() => {
    if (!isBreakActive) {
      return undefined;
    }

    if (breakSecondsRemaining <= 0) {
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
  }, [isBreakActive, breakSecondsRemaining]);

  useEffect(() => {
    if (!isBreakActive) {
      return;
    }

    const breakEndsAt = Date.now() + (breakSecondsRemaining * 1000);
    localStorage.setItem(
      getStep3BreakKey(examMode),
      JSON.stringify({
        ...(breakSession || {}),
        breakEndsAt,
        dayKey: breakSession?.dayKey || 'DAY_1',
        blockNumber: breakSession?.blockNumber || 1,
        nextDayKey: breakSession?.nextDayKey || 'DAY_1',
        nextBlockNumber: breakSession?.nextBlockNumber || 1
      })
    );
  }, [isBreakActive, breakSecondsRemaining, breakSession, examMode]);

  const handleStartExamFromBreak = () => {
    const resumeTarget = resolveBreakResumeTarget(breakSession);

    setIsBreakActive(false);
    setBreakSession(null);
    localStorage.removeItem(getStep3BreakKey(examMode));

    if (!resumeTarget) {
      navigate('/exams/usmle/step3-pretest');
      return;
    }

    navigate(`/exams/usmle/step3-pretest/block/${resumeTarget.dayKey}/${resumeTarget.blockNumber}`);
  };

  const handleReturnToStep3Overview = () => {
    navigate('/exams/usmle/step3-pretest');
  };

  const groupedQuestions = useMemo(() => {
    const grouped = {
      DAY_1: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
      DAY_2: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    };

    (test?.questions || []).forEach((question) => {
      const dayKey = question.examDay === 'DAY_2' ? 'DAY_2' : 'DAY_1';
      const blockNumber = Number(question.blockNumber) || 1;
      if (grouped[dayKey] && grouped[dayKey][blockNumber]) {
        grouped[dayKey][blockNumber].push(question);
      }
    });

    return grouped;
  }, [test]);

  const dayQuestionCounts = useMemo(
    () =>
      DAY_KEYS.reduce((accumulator, dayKey) => {
        const dayBlocks = groupedQuestions[dayKey] || {};
        accumulator[dayKey] = Object.values(dayBlocks).reduce((count, blockQuestions) => count + blockQuestions.length, 0);
        return accumulator;
      }, {}),
    [groupedQuestions]
  );

  const isDayUnlocked = (dayKey) => {
    if (examMode === 'free') {
      return true;
    }

    if (dayKey === 'DAY_1') {
      return true;
    }

    return Object.keys(completedBlocks.DAY_1 || {}).length === BLOCK_COUNT_PER_DAY;
  };

  const isBlockUnlocked = (dayKey, blockNumber) => {
    if (!isDayUnlocked(dayKey)) {
      return false;
    }

    const blockQuestions = groupedQuestions[dayKey]?.[blockNumber] || [];
    if (blockQuestions.length === 0) {
      return false;
    }

    const savedBlockState = completedBlocks[dayKey]?.[blockNumber];
    const currentSignature = getStep3BlockSignature(blockQuestions);

    if (examMode === 'free') {
      return true;
    }

    if (savedBlockState?.contentSignature === currentSignature) {
      return true;
    }

    if (blockNumber === 1) {
      return true;
    }

    const previousBlockState = completedBlocks[dayKey]?.[blockNumber - 1];
    const previousBlockQuestions = groupedQuestions[dayKey]?.[blockNumber - 1] || [];
    return Boolean(previousBlockState?.contentSignature === getStep3BlockSignature(previousBlockQuestions));
  };

  const getBlockStatus = (dayKey, blockNumber) => {
    const blockQuestions = groupedQuestions[dayKey]?.[blockNumber] || [];
    if (blockQuestions.length === 0) {
      return 'empty';
    }

    const savedBlockState = completedBlocks[dayKey]?.[blockNumber];
    if (savedBlockState?.contentSignature === getStep3BlockSignature(blockQuestions)) {
      return 'completed';
    }

    return isBlockUnlocked(dayKey, blockNumber) ? 'unlocked' : 'locked';
  };

  const handleOpenBlock = (dayKey, blockNumber) => {
    if (!isBlockUnlocked(dayKey, blockNumber)) {
      return;
    }

    navigate(`/exams/usmle/step3-pretest/block/${dayKey}/${blockNumber}`, {
      state: {
        examMode
      }
    });
  };

  const getCompletedCount = (dayKey) =>
    Object.entries(completedBlocks[dayKey] || {}).filter(([blockNumber, blockState]) => {
      const numericBlock = Number(blockNumber);
      const blockQuestions = groupedQuestions[dayKey]?.[numericBlock] || [];
      return blockState?.contentSignature === getStep3BlockSignature(blockQuestions);
    }).length;

  if (loading) {
    return <div className="plab1-test-loading">Loading Step 3 exam...</div>;
  }

  if (error) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <div className="plab1-test-error">{error}</div>
          <button className="review-primary" onClick={() => navigate('/exams/usmle/step3-pretest')}>
            Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <div className="plab1-test-error">No published Step 3 questions found.</div>
          <button className="review-primary" onClick={() => navigate('/exams/usmle/step3-pretest')}>
            Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (isBreakActive) {
    const breakMinutes = String(Math.floor(Math.max(breakSecondsRemaining, 0) / 60)).padStart(2, '0');
    const breakSeconds = String(Math.max(breakSecondsRemaining, 0) % 60).padStart(2, '0');

    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper usmle-step3-exam-wrapper">
          <h1>{test.title || 'USMLE Step 3 Pre-Test'}</h1>
          <p className="admin-tests-subtitle" style={{ marginBottom: '1rem' }}>
            Your break is active. You can leave this page and come back later.
          </p>

          <section className="review-score-highlight" aria-label="Step 3 break overview">
            <p className="review-score-label">Break Time Remaining</p>
            <p className="review-score-main" style={{ fontSize: '3.25rem', fontWeight: '800', margin: '0.5rem 0' }}>
              {breakMinutes}:{breakSeconds}
            </p>
            <p className="review-score-subtext">
              Resume target: Block {breakSession?.nextBlockNumber || 1} on {breakSession?.nextDayKey || 'DAY_1'}
            </p>
          </section>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="amc-step1-exam-btn primary"
              onClick={handleStartExamFromBreak}
              style={{ minWidth: '160px', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              Start Exam
            </button>
            <button
              type="button"
              className="amc-step1-exam-btn primary"
              onClick={handleReturnToStep3Overview}
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

  return (
    <div className="plab1-test-page">
      <Header />

      <main className="plab1-test-wrapper usmle-step3-exam-wrapper">
        <h1>{test.title || 'USMLE Step 3 Pre-Test'}</h1>
        <section className="step1-mode-selector" aria-label="Choose Step 3 exam mode">
          <div className="step1-mode-copy">
            <p className="step1-mode-kicker">Choose Exam Mode</p>
            <h2>Professional Way or Free Blocks</h2>
            <p>
              Professional Way keeps day-wise sequential unlocks. Free Blocks opens all published blocks.
            </p>
          </div>

          <div className="step1-mode-actions">
            <button
              type="button"
              className={`step1-mode-btn ${examMode === 'professional' ? 'active' : ''}`}
              onClick={() => setExamMode('professional')}
            >
              Professional Way
            </button>
            <button
              type="button"
              className={`step1-mode-btn ${examMode === 'free' ? 'active' : ''}`}
              onClick={() => setExamMode('free')}
            >
              Free Blocks
            </button>
          </div>
        </section>

        <p className="admin-tests-subtitle" style={{ marginBottom: '1rem' }}>
          {examMode === 'free'
            ? 'Free mode: open any published block from Day 1 or Day 2.'
            : 'Professional mode: complete blocks in order to unlock the next block and then Day 2.'}
        </p>

        <section className="usmle-step3-day-grid" aria-label="Step 3 day and block cards">
          {DAY_KEYS.map((dayKey) => (
            <article
              key={dayKey}
              className={`usmle-day-card usmle-block-card ${isDayUnlocked(dayKey) ? 'unlocked' : 'locked'}`}
            >
              <div className="block-card-topline">
                <span className="block-card-title">{DAY_LABELS[dayKey]}</span>
                <span className="block-lock-icon" />
              </div>
              <span className="block-card-state">
                {isDayUnlocked(dayKey) ? `${getCompletedCount(dayKey)}/${BLOCK_COUNT_PER_DAY} blocks complete` : 'Locked'}
              </span>
              <span className="block-card-description">
                {dayKey === 'DAY_1'
                  ? 'Foundations of Independent Practice'
                  : 'Advanced Clinical Medicine with CCS'}
              </span>
              <span className="block-card-meta">
                {dayQuestionCounts[dayKey] || 0} published questions
              </span>

              <div className="usmle-step3-block-grid">
                {[1, 2, 3, 4, 5, 6].map((blockNumber) => {
                    const status = getBlockStatus(dayKey, blockNumber);
                    const blockQuestions = groupedQuestions[dayKey]?.[blockNumber] || [];
                    const canOpen = status === 'unlocked' || status === 'completed';

                  return (
                    <button
                      key={`${dayKey}-${blockNumber}`}
                      type="button"
                      className={`usmle-block-card ${status}`}
                      onClick={() => handleOpenBlock(dayKey, blockNumber)}
                      disabled={!canOpen}
                    >
                      <div className="block-card-topline">
                        <span className="block-card-title">Block {blockNumber}</span>
                        <span className="block-lock-icon" />
                      </div>
                      <span className="block-card-state">
                        {status === 'completed'
                          ? 'Completed'
                          : status === 'unlocked'
                            ? 'Unlocked'
                            : status === 'empty'
                              ? 'No questions'
                              : 'Locked'}
                      </span>
                      <span className="block-card-description">
                        {blockQuestions.length} question{blockQuestions.length === 1 ? '' : 's'} in this block
                      </span>
                      <span className="block-card-meta">
                        {canOpen
                          ? status === 'completed'
                            ? 'Click to re-open'
                            : 'Click to open'
                          : examMode === 'free'
                            ? 'No questions in this block'
                            : 'Finish previous block first'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default USMLEStep3Exam;
