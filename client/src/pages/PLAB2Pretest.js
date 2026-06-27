import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../config/api';
import './PLAB2Pretest.css';

function PLAB2Pretest() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [showIdealAnswer, setShowIdealAnswer] = useState({});

  useEffect(() => {
    const fetchPretestScenarios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/plab-content/plab2-pretest-scenarios`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError('Pretest scenarios are not available right now.');
          setLoading(false);
          return;
        }

        setContent(data.data);
      } catch (fetchError) {
        console.error('Error fetching PLAB-2 pretest scenarios:', fetchError);
        setError('Unable to load pretest scenarios right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchPretestScenarios();
  }, []);

  const sortedScenarios = content?.sections
    ? [...content.sections].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const handleAnswerChange = (scenarioIndex, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [scenarioIndex]: value
    }));
  };

  const handleToggleIdealAnswer = (scenarioIndex) => {
    setShowIdealAnswer((prev) => ({
      ...prev,
      [scenarioIndex]: !prev[scenarioIndex]
    }));
  };

  return (
    <div className="plab2-pretest-page">
      <Header />

      <div className="plab2-pretest-hero">
        <div className="plab2-pretest-hero-content">
          <h1>{content?.title || 'PLAB-2 Pretest Scenarios'}</h1>
          {content?.subtitle && <p>{content.subtitle}</p>}
        </div>
      </div>

      <main className="plab2-pretest-container">
        {content?.description && (
          <section className="plab2-pretest-card intro-card">
            <p>{content.description}</p>
          </section>
        )}

        {loading && <section className="plab2-pretest-card">Loading scenarios...</section>}

        {!loading && error && <section className="plab2-pretest-card error-card">{error}</section>}

        {!loading && !error && sortedScenarios.length === 0 && (
          <section className="plab2-pretest-card">No scenarios added yet.</section>
        )}

        {!loading && !error && sortedScenarios.map((scenario, index) => (
          <section key={scenario._id || index} className="plab2-pretest-card scenario-card">
            <h2>Scenario {index + 1}</h2>
            <p className="scenario-question">{scenario.heading}</p>

            <label htmlFor={`scenario-answer-${index}`} className="scenario-answer-label">
              Write your answer:
            </label>
            <textarea
              id={`scenario-answer-${index}`}
              className="scenario-answer-input"
              rows={6}
              value={userAnswers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Write your response here, then click Show Answer to compare with the ideal answer."
            />

            <button
              type="button"
              className="show-answer-btn"
              onClick={() => handleToggleIdealAnswer(index)}
            >
              {showIdealAnswer[index] ? 'Hide Answer' : 'Show Answer'}
            </button>

            {showIdealAnswer[index] && (
              <div className="ideal-answer-box">
                <h3>Ideal Answer</h3>
                <p>{scenario.content}</p>
              </div>
            )}
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}

export default PLAB2Pretest;
