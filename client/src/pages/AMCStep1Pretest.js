import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AMCStep1Pretest.css';

const examHighlights = [
  {
    title: 'Duration',
    value: '3.5 hours',
    note: 'Single continuous CAT testing session.'
  },
  {
    title: 'Questions',
    value: '150 MCQs',
    note: 'Clinical scenario-based single-best-answer questions.'
  },
  {
    title: 'Format',
    value: 'Best-of-four',
    note: 'Choose one best answer from four options for each case.'
  }
];

function AMCStep1Pretest() {
  const navigate = useNavigate();

  return (
    <div className="amc-step1-pretest-page">
      <Header />

      <main className="amc-step1-pretest-content">
        <section className="amc-step1-pretest-hero" aria-label="AMC Step 1 pretest overview">
          <p className="amc-step1-pretest-kicker">AMC Step 1 Pretest</p>
          <h1>Computer-Adaptive Test (CAT)</h1>
          <p>
            Prepare for the AMC Step 1 CAT with this structure overview before beginning your
            timed practice.
          </p>
        </section>

        <section className="amc-step1-pretest-grid" aria-label="AMC Step 1 CAT details">
          {examHighlights.map((item) => (
            <article className="amc-step1-pretest-card" key={item.title}>
              <h2>{item.title}</h2>
              <p className="amc-step1-pretest-value">{item.value}</p>
              <p className="amc-step1-pretest-note">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="amc-step1-pretest-format" aria-label="Best-of-four format explanation">
          <h3>Best-of-Four Format</h3>
          <p>
            You read a short clinical scenario, then select the single best answer from the four
            options provided.
          </p>

          <button
            type="button"
            className="amc-step1-start-exam-btn"
            onClick={() => navigate('/exams/amc/step1-pretest/exam')}
          >
            Start Exam
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AMCStep1Pretest;
