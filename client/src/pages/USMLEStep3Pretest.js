import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './USMLEStep1Pretest.css';

const examStructure = [
  {
    title: 'Exam Format',
    value: 'Two-day exam',
    note: 'Step 3 is divided into Day 1 and Day 2 with different formats and goals.'
  },
  {
    title: 'Day 1',
    value: 'FIP',
    note: '6 blocks of approximately 38 to 40 MCQs focused on diagnosis, science integration, and initial management (approximately 7 hours testing time).'
  },
  {
    title: 'Day 2',
    value: 'ACM + CCS',
    note: '6 blocks of approximately 30 MCQs plus CCS interactive patient scenarios where you make management decisions over simulated time (approximately 9 hours testing time).'
  },
  {
    title: 'Breaks',
    value: '45 min/day',
    note: 'Break time can be extended if you skip the tutorial.'
  }
];

function USMLEStep3Pretest() {
  const navigate = useNavigate();

  return (
    <div className="usmle-step1-pretest-page">
      <Header />

      <main className="usmle-step1-pretest-content">
        <section className="step1-pretest-hero" aria-label="USMLE Step 3 pretest overview">
          <p className="step1-pretest-kicker">USMLE Step 3 Pre-Test</p>
          <h1>Exam Structure</h1>
          <p>
            Review the official two-day structure to plan stamina, pacing, and break strategy for
            your Step 3 pre-test.
          </p>
        </section>

        <section className="step1-pretest-grid" aria-label="USMLE Step 3 exam structure details">
          {examStructure.map((item) => (
            <article className="step1-pretest-card" key={item.title}>
              <h2>{item.title}</h2>
              <p className="step1-pretest-value">{item.value}</p>
              <p className="step1-pretest-note">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="step1-pretest-summary" aria-label="USMLE Step 3 day-wise breakdown">
          <h3>Detailed Breakdown</h3>
          <div className="step1-summary-row">
            <div className="step1-summary-pill">
              <span>Day 1: Foundations of Independent Practice (FIP)</span>
              <strong>6 blocks of approximately 38 to 40 MCQs</strong>
            </div>
            <div className="step1-summary-pill">
              <span>Day 2: Advanced Clinical Medicine (ACM)</span>
              <strong>6 blocks of approximately 30 MCQs + CCS</strong>
            </div>
            <div className="step1-summary-pill">
              <span>Breaks</span>
              <strong>45 minutes per day</strong>
            </div>
          </div>

          <button
            type="button"
            className="step1-start-exam-btn"
            onClick={() => navigate('/exams/usmle/step3-pretest/exam')}
          >
            Start Exam
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default USMLEStep3Pretest;
