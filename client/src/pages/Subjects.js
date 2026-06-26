import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Subjects.css';

function Subjects() {
  const navigate = useNavigate();
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllSubjects = async () => {
      setLoading(true);
      setError('');

      try {
        const [plabRes, usmleRes, amcRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/plab-theory-subjects`),
          fetch(`${API_BASE_URL}/api/usmle-subjects`),
          fetch(`${API_BASE_URL}/api/amc-subjects`)
        ]);

        const [plabData, usmleData, amcData] = await Promise.all([
          plabRes.ok ? plabRes.json() : [],
          usmleRes.ok ? usmleRes.json() : [],
          amcRes.ok ? amcRes.json() : []
        ]);

        const merged = [
          ...(Array.isArray(plabData) ? plabData : []).map((subject, index) => ({
            id: subject._id || `plab-${index}`,
            name: subject.name || 'Untitled Subject',
            source: 'PLAB',
            step: '',
            contentPath: `/theory/${subject._id || `plab-${index}`}`
          })),
          ...(Array.isArray(usmleData) ? usmleData : []).map((subject, index) => ({
            id: subject._id || `usmle-${index}`,
            name: subject.name || 'Untitled Subject',
            source: 'USMLE',
            step: subject.step || '',
            contentPath: `/exams/usmle/theory/${subject._id || `usmle-${index}`}`
          })),
          ...(Array.isArray(amcData) ? amcData : []).map((subject, index) => ({
            id: subject._id || `amc-${index}`,
            name: subject.name || 'Untitled Subject',
            source: 'AMC',
            step: subject.step || '',
            contentPath: `/exams/amc/theory/${subject._id || `amc-${index}`}`
          }))
        ];

        const deduped = [];
        const seenNames = new Set();

        merged.forEach((subject) => {
          const normalizedName = subject.name.trim().toLowerCase();
          if (!normalizedName || seenNames.has(normalizedName)) {
            return;
          }

          seenNames.add(normalizedName);
          deduped.push(subject);
        });

        deduped.sort((a, b) => a.name.localeCompare(b.name));
        setAllSubjects(deduped);
      } catch (fetchError) {
        console.error('Error loading all subjects:', fetchError);
        setError('Unable to load subjects right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return allSubjects;
    }

    return allSubjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSubjects, searchTerm]);

  const openSubjectContent = (contentPath) => {
    navigate(contentPath);
  };

  return (
    <div className="subjects-page">
      <Header />
      <div className="subjects-container">
        <div className="subjects-header">
          <span className="subjects-kicker">Unified Learning Hub</span>
          <h1>All Medical Subjects</h1>
          <p>Click any subject tab to open its theory content directly.</p>
        </div>

        <section className="subjects-tabs-section" aria-label="All subjects">
          <div className="subjects-tabs-top">
            <h2>Subject Tabs</h2>
          </div>
          <div className="subject-search-wrap">
            <input
              type="text"
              className="subject-search-input"
              placeholder="Search subject name..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p className="subjects-status">Loading subjects...</p>}
          {!loading && error && <p className="subjects-status error">{error}</p>}

          {!loading && !error && filteredSubjects.length === 0 && (
            <p className="subjects-status">No subjects found.</p>
          )}

          {!loading && !error && filteredSubjects.length > 0 && (
            <div className="subject-tabs-grid" role="tablist" aria-label="Subject tabs">
              {filteredSubjects.map((subject) => (
                <button
                  key={`${subject.source}-${subject.id}`}
                  type="button"
                  className="subject-tab-item"
                  onClick={() => openSubjectContent(subject.contentPath)}
                >
                  <span className="subject-tab-name">{subject.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default Subjects;
