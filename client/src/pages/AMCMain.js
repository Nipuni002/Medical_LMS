import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AMCMain.css';

function AMCMain() {
  const navigate = useNavigate();
  const steps = useMemo(
    () => [
      {
        id: 'amc-cat-mcq',
        title: 'Step 1: AMC CAT MCQ Examination',
        subtitle: 'Computer Adaptive Theory Assessment',
        description:
          'Test your clinical reasoning and foundational medical knowledge using adaptive MCQ scenarios.',
        image: '/images/AMC1.png',
        color: '#1d4ed8',
        accent: '#38bdf8'
      },
      {
        id: 'amc-clinical-osce',
        title: 'Step 2: AMC Clinical Examination (OSCE)',
        subtitle: 'Hands-on Clinical Skills Validation',
        description:
          'Practice communication, diagnosis, and patient-management skills in station-based OSCE format.',
        image: '/images/AMC2.png',
        color: '#2563eb',
        accent: '#93c5fd'
      }
    ],
    []
  );

  const [selectedStep, setSelectedStep] = useState(steps[0].id);

  const handleTheoryBankClick = (stepId) => {
    if (stepId === 'amc-cat-mcq') {
      navigate('/exams/amc/step1-subjects');
      return;
    }

    if (stepId === 'amc-clinical-osce') {
      navigate('/exams/amc/step2-subjects');
      return;
    }

    setSelectedStep(stepId);
  };

  const handlePretestClick = (stepId) => {
    if (stepId === 'amc-cat-mcq') {
      navigate('/exams/amc/step1-pretest');
      return;
    }

    if (stepId === 'amc-clinical-osce') {
      navigate('/exams/amc/step2-pretest');
      return;
    }

    setSelectedStep(stepId);
  };

  return (
    <div className="amc-main">
      <Header />

      <main className="amc-content">
        <section className="amc-hero">
          <h1>Australian Medical Council (AMC)</h1>
          <p>Select a step to begin your AMC exam preparation pathway.</p>
        </section>

        <section className="amc-panel" aria-label="AMC steps panel">
          <div className="amc-steps-grid" aria-label="AMC step cards">
            {steps.map((step) => (
              <article
                key={step.id}
                className={`amc-step-card ${selectedStep === step.id ? 'active' : ''}`}
                onClick={() => setSelectedStep(step.id)}
                style={{
                  '--amc-color': step.color,
                  '--amc-accent': step.accent
                }}
              >
                <div className="amc-card-image-wrap">
                  <img src={step.image} alt={step.title} className="amc-card-image" />
                  <div className="amc-card-image-overlay" />
                </div>

                <div className="amc-card-body">
                  <h3>{step.title}</h3>
                  <p className="amc-subtitle">{step.subtitle}</p>
                  <p className="amc-description">{step.description}</p>

                  <div className="amc-card-actions">
                    <button
                      type="button"
                      className="amc-action-btn theory"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTheoryBankClick(step.id);
                      }}
                    >
                      Theory Bank
                    </button>
                    <button
                      type="button"
                      className="amc-action-btn pretest"
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePretestClick(step.id);
                      }}
                    >
                      Pretest
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AMCMain;
