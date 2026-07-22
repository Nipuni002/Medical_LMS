import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './USMLEMain.css';

function USMLEMain() {
  const navigate = useNavigate();
  const tabs = useMemo(
    () => [
      {
        id: 'step1',
        label: 'STEP 1',
        subtitle: 'Basic Science Foundation',
        icon: '🧠',
        image: '/images/USMLE1.png',
        description:
          'Integrated basic sciences with pathology, pharmacology, and physiology in clinical context.',
        color: '#1E3A8A',
        accentColor: '#60A5FA',
        glassStart: 'rgba(30, 58, 138, 0.82)',
        glassEnd: 'rgba(59, 130, 246, 0.72)'
      },
      {
        id: 'step2ck',
        label: 'STEP 2 CK',
        subtitle: 'Clinical Knowledge',
        icon: '🩺',
        image: '/images/USMLE2.png',
        description:
          'Diagnosis and management across core disciplines with high-yield patient-centered scenarios.',
        color: '#1D4ED8',
        accentColor: '#38BDF8',
        glassStart: 'rgba(29, 78, 216, 0.82)',
        glassEnd: 'rgba(56, 189, 248, 0.72)'
      },
      {
        id: 'step3',
        label: 'STEP 3',
        subtitle: 'Independent Medical Practice',
        icon: '🏥',
        image: '/images/USMLE3.png',
        description:
          'Advanced decision-making and readiness for unsupervised medical practice.',
        color: '#1E40AF',
        accentColor: '#93C5FD',
        glassStart: 'rgba(30, 64, 175, 0.82)',
        glassEnd: 'rgba(147, 197, 253, 0.72)'
      }
    ],
    []
  );

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTheoryBankClick = (tabId) => {
    if (tabId === 'step1') {
      navigate('/exams/usmle/step1-subjects');
      return;
    }

    if (tabId === 'step2ck') {
      navigate('/exams/usmle/step2-subjects');
      return;
    }

    if (tabId === 'step3') {
      navigate('/exams/usmle/step3-subjects');
      return;
    }

    setActiveTab(tabId);
  };

  const handleIntroductionClick = (tabId) => {
    if (tabId === 'step1') {
      navigate('/exams/usmle/step1-introduction');
      return;
    }

    setActiveTab(tabId);
  };

  const handlePretestClick = (tabId) => {
    if (tabId === 'step1') {
      navigate('/exams/usmle/step1-pretest');
      return;
    }

    if (tabId === 'step2ck') {
      navigate('/exams/usmle/step2-pretest');
      return;
    }

    if (tabId === 'step3') {
      navigate('/exams/usmle/step3-pretest');
      return;
    }

    setActiveTab(tabId);
  };

  return (
    <div className="usmle-main">
      <Header />

      <main className="usmle-content">
        <section className="usmle-hero">
          <h1>United States Medical Licensing Examination (USMLE)</h1>
          <p>Select a step to explore the exam focus and preparation direction.</p>
        </section>

        <section className="usmle-panel" aria-label="USMLE steps panel">
          <div className="usmle-sections-grid" aria-label="USMLE step cards">
            {tabs.map((tab) => (
              <article
                key={tab.id}
                role="button"
                tabIndex={0}
                aria-pressed={activeTab === tab.id}
                className={`usmle-step-card ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  '--card-color': tab.color,
                  '--card-accent-color': tab.accentColor,
                  '--card-glass-start': tab.glassStart,
                  '--card-glass-end': tab.glassEnd
                }}
              >
                <div className="usmle-card-header">
                  <div className="usmle-card-icon" style={{ backgroundColor: `${tab.accentColor}40` }}>
                    {tab.icon}
                  </div>
                  <div className="usmle-title-wrap">
                    <h3>{tab.label}</h3>
                    <p>{tab.subtitle}</p>
                  </div>
                </div>

                <div className="usmle-card-image">
                  <img src={tab.image} alt={tab.label} />
                  <div
                    className="usmle-image-overlay"
                    style={{ background: `linear-gradient(to bottom, transparent 55%, ${tab.color}22)` }}
                  />
                </div>

                <div className="usmle-card-content">
                  <p>{tab.description}</p>
                </div>

                {tab.id === 'step1' ? (
                  <div className="usmle-card-actions step1-actions">
                    <button
                      type="button"
                      className="usmle-action-btn intro"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleIntroductionClick(tab.id);
                      }}
                    >
                      Introduction
                    </button>

                    <div className="usmle-secondary-actions">
                      <button
                        type="button"
                        className="usmle-action-btn theory"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleTheoryBankClick(tab.id);
                        }}
                      >
                        Theory Bank
                      </button>
                      <button
                        type="button"
                        className="usmle-action-btn pretest"
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePretestClick(tab.id);
                        }}
                      >
                        Pretest
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="usmle-card-actions">
                    <button
                      type="button"
                      className="usmle-action-btn theory"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTheoryBankClick(tab.id);
                      }}
                    >
                      Theory Bank
                    </button>
                    <button
                      type="button"
                      className="usmle-action-btn pretest"
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePretestClick(tab.id);
                      }}
                    >
                      Pretest
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default USMLEMain;