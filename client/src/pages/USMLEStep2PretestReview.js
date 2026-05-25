import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Test.css';

function USMLEStep2PretestReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;
  const answers = location.state?.answers || {};
  const [reviewMode, setReviewMode] = useState('all');

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

  if (!test || !test.questions) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <div className="plab1-test-error">No completed USMLE pre-test found.</div>
          <button className="review-primary" onClick={() => navigate('/exams/usmle/step2-pretest/exam')}>
            Start Exam
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const sortedQuestions = [...test.questions].sort((a, b) => {
    const blockA = Number(a.blockNumber) || 1;
    const blockB = Number(b.blockNumber) || 1;
    if (blockA !== blockB) {
      return blockA - blockB;
    }
    return (a.order || 0) - (b.order || 0);
  });

  const score = sortedQuestions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctOption ? 1 : 0);
  }, 0);

  const totalQuestions = sortedQuestions.length;
  const percentageScore = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  const incorrectCount = totalQuestions - score;

  const reviewedQuestions = useMemo(() => {
    if (reviewMode === 'incorrect') {
      return sortedQuestions
        .map((question, index) => ({ question, index }))
        .filter(({ question, index }) => answers[index] !== question.correctOption);
    }

    return sortedQuestions.map((question, index) => ({ question, index }));
  }, [reviewMode, sortedQuestions, answers]);

  return (
    <div className="plab1-test-page">
      <Header />

      <main className="plab1-test-wrapper">
        <h1>USMLE Step 2 CK Pre-Test Review</h1>

        <section className="review-score-highlight" aria-label="Score Summary">
          <p className="review-score-label">Total Score</p>
          <p className="review-score-main">{score}/{totalQuestions}</p>
          <p className="review-score-percentage">{percentageScore}%</p>
          <p className="review-score-subtext">Correct: {score} | Incorrect: {incorrectCount}</p>
        </section>

        <div className="review-actions">
          <button className={`review-action-btn ${reviewMode === 'all' ? 'active' : ''}`} onClick={() => setReviewMode('all')}>
            Review All
          </button>
          <button className={`review-action-btn ${reviewMode === 'incorrect' ? 'active' : ''}`} onClick={() => setReviewMode('incorrect')}>
            Review Incorrect Only
          </button>
          <button className="review-primary" onClick={() => navigate('/exams/usmle/step2-pretest/exam')}>
            Reattempt Exam
          </button>
          <button className="review-primary" onClick={() => navigate('/exams/usmle/step2-pretest')}>
            Exit Exam Page
          </button>
        </div>

        {reviewedQuestions.map(({ question, index }) => (
          <article key={`${question._id || 'q'}-${index}`} className="review-question-card">
            <h3>
              Block {question.blockNumber || 1} | Q{index + 1}. {question.questionText}
            </h3>
            <p className={`review-result-badge ${answers[index] === question.correctOption ? 'correct' : 'wrong'}`}>
              {answers[index] === question.correctOption ? 'You are correct' : 'Incorrect answer'}
            </p>
            <p className="review-answer-line">Your answer: {answers[index] || 'Not answered'}</p>
            <p className="review-answer-line">Correct answer: {question.correctOption}</p>

            <ul className="review-option-list">
              {(question.options || []).map((option) => {
                const isCorrect = option.key === question.correctOption;
                const isSelected = answers[index] === option.key;

                return (
                  <li key={option.key} className={`${isCorrect ? 'correct' : ''} ${isSelected && !isCorrect ? 'wrong' : ''}`}>
                    <span className="review-option-text">{option.key}. {option.text}</span>
                  </li>
                );
              })}
            </ul>

            {question.explanation && (
              <div className="review-explanation">
                <strong>Explanation:</strong>
                <div className="review-explanation-content" dangerouslySetInnerHTML={{ __html: sanitizeExplanationHtml(question.explanation) }} />
              </div>
            )}
          </article>
        ))}
      </main>

      <Footer />
    </div>
  );
}

export default USMLEStep2PretestReview;
