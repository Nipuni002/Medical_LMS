import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './USMLEStep1Pretest.css';

const examStructure = [
  {
    title: 'Blocks in One Day',
    value: '7 blocks',
    note: 'The full exam is delivered in a single test day.'
  },
  {
    title: 'Questions per Block',
    value: 'Up to 40',
    note: 'Every block can contain a maximum of 40 MCQs.'
  },
  {
    title: 'Time per Block',
    value: '60 minutes',
    note: 'Each block is strictly timed and auto-submits at the end.'
  },
  {
    title: 'Total Testing Time',
    value: '7 hours',
    note: 'Total question-solving time across all blocks.'
  },
  {
    title: 'Break Time',
    value: '45 minutes',
    note: 'Total break time available between blocks.'
  }
];

function USMLEStep1Pretest() {
  const navigate = useNavigate();

  return (
    <div className="usmle-step1-pretest-page">
      <Header />

      <main className="usmle-step1-pretest-content">
        <section className="step1-pretest-hero" aria-label="USMLE Step 1 pretest overview">
          <p className="step1-pretest-kicker">USMLE Step 1 Pre-Test</p>
          <h1>Exam Structure</h1>
          <p>
            Use this snapshot to plan pace, stamina, and break strategy before your Step 1 pre-test.
          </p>
        </section>

        <section className="step1-pretest-grid" aria-label="Step 1 exam structure details">
          {examStructure.map((item) => (
            <article className="step1-pretest-card" key={item.title}>
              <h2>{item.title}</h2>
              <p className="step1-pretest-value">{item.value}</p>
              <p className="step1-pretest-note">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="step1-pretest-summary" aria-label="Step 1 quick summary">
          <h3>Quick Planning Summary</h3>
          <div className="step1-summary-row">
            <div className="step1-summary-pill">
              <span>Maximum Questions</span>
              <strong>280</strong>
            </div>
            <div className="step1-summary-pill">
              <span>Average Time per Question</span>
              <strong>90 seconds</strong>
            </div>
            <div className="step1-summary-pill">
              <span>Total Day Duration</span>
              <strong>7h 45m</strong>
            </div>
          </div>

          <button
            type="button"
            className="step1-start-exam-btn"
            onClick={() => navigate('/exams/usmle/step1-pretest/exam')}
          >
            Start Exam
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default USMLEStep1Pretest;
