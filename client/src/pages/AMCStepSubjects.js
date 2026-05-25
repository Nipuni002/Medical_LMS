import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './USMLEStep1Subjects.css';

const WEIGHTAGE_ORDER = [
  'VERY HIGH WEIGHTAGE',
  'HIGH WEIGHTAGE',
  'MODERATE WEIGHTAGE',
  'LOW WEIGHTAGE'
];

function AMCStepSubjects({
  step = 'STEP_1',
  heading = 'AMC Step 1 Subjects',
  description = 'Choose a subject to open AMC theory content.'
}) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    const fetchStepSubjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/amc-subjects?step=${step}`);
        if (!response.ok) {
          setSubjects([]);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          setSubjects([]);
          return;
        }

        const mappedSubjects = data.map((subject, index) => ({
          id: subject._id || `${step.toLowerCase()}-${index}`,
          name: subject.name,
          weightage: subject.weightage || 'MODERATE WEIGHTAGE',
          weightageValue: Number.isFinite(Number(subject.weightageValue)) ? Number(subject.weightageValue) : 5,
          color: subject.color ? `${subject.color}aa` : 'rgba(29, 78, 216, 0.64)'
        })).sort((a, b) => {
          if (a.weightageValue !== b.weightageValue) {
            return b.weightageValue - a.weightageValue;
          }
          return a.name.localeCompare(b.name);
        });

        setSubjects(mappedSubjects);
      } catch (error) {
        console.error('Failed to fetch AMC subjects:', error);
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchStepSubjects();
  }, [step]);

  const openSubjectContent = (subjectId) => {
    navigate(`/exams/amc/theory/${subjectId}`);
  };

  const groupedSubjects = useMemo(() => {
    const grouped = WEIGHTAGE_ORDER.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});

    subjects.forEach((subject) => {
      const key = WEIGHTAGE_ORDER.includes(subject.weightage) ? subject.weightage : 'MODERATE WEIGHTAGE';
      grouped[key].push(subject);
    });

    return grouped;
  }, [subjects]);

  const getWeightageBadgeClass = (weightage) => {
    switch (weightage) {
      case 'VERY HIGH WEIGHTAGE':
        return 'weightage-very-high';
      case 'HIGH WEIGHTAGE':
        return 'weightage-high';
      case 'MODERATE WEIGHTAGE':
        return 'weightage-moderate';
      case 'LOW WEIGHTAGE':
        return 'weightage-low';
      default:
        return 'weightage-other';
    }
  };

  return (
    <div className="usmle-step1-page">
      <Header />

      <main className="usmle-step1-content">
        <section className="usmle-step1-hero">
          <h1>{heading}</h1>
          <p>{description}</p>
        </section>

        <section className="usmle-step1-panel">
          {loadingSubjects ? (
            <div className="subject-tabs" role="group" aria-label="AMC subject buttons">
              <p className="subject-empty-state">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="subject-tabs" role="group" aria-label="AMC subject buttons">
              <p className="subject-empty-state">No subjects available yet. Admin can add AMC subjects from the admin panel.</p>
            </div>
          ) : (
            <div className="subject-groups" aria-label="AMC subjects by weightage">
              {WEIGHTAGE_ORDER.map((weightage) => {
                const list = groupedSubjects[weightage] || [];
                if (list.length === 0) {
                  return null;
                }

                return (
                  <section key={weightage} className="weightage-section">
                    <div className="section-header">
                      <span className={`weightage-badge ${getWeightageBadgeClass(weightage)}`}>{weightage}</span>
                      <span className="subject-count">{list.length} topics</span>
                    </div>
                    <div className="subject-tabs" role="group" aria-label={`${weightage} AMC subjects`}>
                      {list.map((subject) => (
                        <button
                          key={subject.id}
                          type="button"
                          className="subject-tab-btn"
                          onClick={() => openSubjectContent(subject.id)}
                          style={{ '--subject-color': subject.color }}
                        >
                          {subject.name}
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AMCStepSubjects;
