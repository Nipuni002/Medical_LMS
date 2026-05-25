import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AMCStep2Pretest.css';

const overviewCards = [
  {
    title: 'Format',
    value: 'Practical, hands-on exam',
    note: 'Station-based assessment focused on safe clinical performance.'
  },
  {
    title: 'Structure',
    value: '16 stations',
    note: 'Each station runs for approximately 10 minutes.'
  },
  {
    title: 'Assessment',
    value: 'Direct interaction',
    note: 'Candidates work with simulated patients and structured tasks.'
  }
];

const skillAreas = [
  'History taking',
  'Physical examination',
  'Communication skills',
  'Clinical decision-making'
];

function AMCStep2Pretest() {
  const navigate = useNavigate();

  return (
    <div className="amc-step2-pretest-page">
      <Header />

      <main className="amc-step2-pretest-content">
        <section className="amc-step2-pretest-hero" aria-label="AMC Step 2 pretest overview">
          <p className="amc-step2-pretest-kicker">AMC Step 2 Pretest</p>
          <h1>Clinical Examination Practice</h1>
          <p>
            Prepare for the AMC Step 2 clinical assessment with a station-based overview designed
            to mirror a real practical exam.
          </p>
        </section>

        <section className="amc-step2-pretest-grid" aria-label="AMC Step 2 format details">
          {overviewCards.map((item) => (
            <article className="amc-step2-pretest-card" key={item.title}>
              <h2>{item.title}</h2>
              <p className="amc-step2-pretest-value">{item.value}</p>
              <p className="amc-step2-pretest-note">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="amc-step2-pretest-panel" aria-label="AMC Step 2 skills assessed">
          <h3>What is assessed</h3>
          <p>
            The goal is to evaluate whether you can apply medical knowledge safely and effectively
            in real-world clinical practice.
          </p>
          <ul className="amc-step2-pretest-skill-list">
            {skillAreas.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        {/* Station structure removed per request */}

        <section className="amc-step2-pretest-cta" aria-label="AMC Step 2 action area">
          <h3>Ready to begin?</h3>
          <p>
            When you're ready, start the Step 2 practical practice exam. Each station will
            guide you through the required tasks.
          </p>
          <button
            type="button"
            className="amc-step2-start-btn"
            onClick={() => navigate('/exams/amc/step2-pretest/exam')}
          >
            Start Exam
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AMCStep2Pretest;
