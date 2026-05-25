import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './NextMain.css';

function NextMain() {
  const navigate = useNavigate();
  const steps = useMemo(
    () => [
      {
        id: 'next-step-1',
        title: 'NExT Step 1',
        subtitle: 'Applied Theory and Clinical Integration',
        description:
          'Build strong conceptual understanding with integrated basic and clinical sciences for Step 1 readiness.',
        image: '/images/Next.jpg',
        color: '#1d4ed8',
        accent: '#60a5fa'
      },
      {
        id: 'next-step-2',
        title: 'NExT Step 2',
        subtitle: 'Practical and Clinical Competency',
        description:
          'Prepare for bedside application, communication, and structured clinical assessment for Step 2.',
        image: '/images/Next2.jpg',
        color: '#2563eb',
        accent: '#93c5fd'
      }
    ],
    []
  );

  const [selectedStep, setSelectedStep] = useState(steps[0].id);

  const handleTheoryBankClick = (stepId) => {
    if (stepId === 'next-step-1') {
      navigate('/exams/next/step1-subjects');
      return;
    }

    if (stepId === 'next-step-2') {
      navigate('/exams/next/step2-subjects');
      return;
    }

    setSelectedStep(stepId);
  };

  return (
    <div className="next-main">
      <Header />

      <main className="next-content">
        <section className="next-hero">
          <h1>NExT Examination</h1>
          <p>Select your NExT step and start with Theory Bank or Pretest.</p>
        </section>

        <section className="next-panel" aria-label="NExT steps panel">
          <div className="next-steps-grid" aria-label="NExT step cards">
            {steps.map((step) => (
              <article
                key={step.id}
                className={`next-step-card ${selectedStep === step.id ? 'active' : ''}`}
                onClick={() => setSelectedStep(step.id)}
                style={{
                  '--next-color': step.color,
                  '--next-accent': step.accent
                }}
              >
                <div className="next-card-image-wrap">
                  <img src={step.image} alt={step.title} className="next-card-image" />
                  <div className="next-card-image-overlay" />
                </div>

                <div className="next-card-body">
                  <h3>{step.title}</h3>
                  <p className="next-subtitle">{step.subtitle}</p>
                  <p className="next-description">{step.description}</p>

                  <div className="next-card-actions">
                    <button
                      type="button"
                      className="next-action-btn theory"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTheoryBankClick(step.id);
                      }}
                    >
                      Theory Bank
                    </button>
                    <button
                      type="button"
                      className="next-action-btn pretest"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedStep(step.id);
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

export default NextMain;
