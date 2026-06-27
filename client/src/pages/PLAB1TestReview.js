import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PLAB1Test.css';

function PLAB1TestReview() {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const questions = test?.questions || [];

  const score = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.correctOption ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const percentageScore = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  const incorrectCount = totalQuestions - score;

  const reviewedQuestions = useMemo(() => {
    if (reviewMode === 'incorrect') {
      return questions
        .map((question, index) => ({ question, index }))
        .filter(({ question, index }) => answers[index] !== question.correctOption);
    }
    return questions.map((question, index) => ({ question, index }));
  }, [reviewMode, questions, answers]);

  if (!test || !test.questions) {
    return (
      <div className="plab1-test-page">
        <Header />
        <main className="plab1-test-wrapper">
          <div className="plab1-test-error">No completed test found. Please start a test.</div>
          <button className="review-primary" onClick={() => navigate('/plab/plab1/tests')}>
            Start Test
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="plab1-test-page">
      <Header />

      <main className="plab1-test-wrapper">
        <h1>Review</h1>
        <section className="review-score-highlight" aria-label="Score Summary">
          <p className="review-score-label">Total Score</p>
          <p className="review-score-main">{score}/{totalQuestions}</p>
          <p className="review-score-percentage">{percentageScore}%</p>
          <p className="review-score-subtext">
            Correct: {score} | Incorrect: {incorrectCount}
          </p>
        </section>

        <div className="review-actions">
          <button
            className={`review-action-btn ${reviewMode === 'all' ? 'active' : ''}`}
            onClick={() => setReviewMode('all')}
          >
            Review All Questions
          </button>
          <button
            className={`review-action-btn ${reviewMode === 'incorrect' ? 'active' : ''}`}
            onClick={() => setReviewMode('incorrect')}
          >
            Review Only Incorrect Questions
          </button>
          <button className="review-primary" onClick={() => navigate('/plab/plab1/tests')}>
            Reattempt Test
          </button>
        </div>

        {reviewedQuestions.map(({ question, index }) => (
          <article key={question._id || index} className="review-question-card">
            <h3>
              {index + 1}. {question.questionText}
            </h3>
            <p className={`review-result-badge ${answers[index] === question.correctOption ? 'correct' : 'wrong'}`}>
              {answers[index] === question.correctOption ? 'You are correct' : 'Incorrect answer'}
            </p>
            <p className="review-answer-line">
              Your answer: {answers[index] ? answers[index] : 'Not answered'}
            </p>
            <p className="review-answer-line">Correct answer: {question.correctOption}</p>

            <ul className="review-option-list">
              {question.options.map((option) => {
                const isCorrect = option.key === question.correctOption;
                const isSelected = answers[index] === option.key;
                const isCorrectSelection = isCorrect && isSelected;

                return (
                  <li
                    key={option.key}
                    className={`${isCorrect ? 'correct' : ''} ${isSelected && !isCorrect ? 'wrong' : ''}`}
                  >
                    {isCorrect && <span className="review-correct-mark" aria-hidden="true">✓</span>}
                    <span className="review-option-text">
                      {option.key}. {option.text}
                    </span>
                    {isCorrectSelection && <span className="review-inline-pill correct-pill">You are correct</span>}
                    {isSelected && !isCorrect && <span className="review-inline-pill wrong-pill">Your selected option</span>}
                  </li>
                );
              })}
            </ul>

            {question.explanation && (
              <div className="review-explanation">
                <strong>Explanation:</strong>
                <div
                  className="review-explanation-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeExplanationHtml(question.explanation) }}
                />
              </div>
            )}
          </article>
        ))}

        {reviewMode === 'incorrect' && reviewedQuestions.length === 0 && (
          <p className="review-empty-state">Excellent work. No incorrect answers to review.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default PLAB1TestReview;
