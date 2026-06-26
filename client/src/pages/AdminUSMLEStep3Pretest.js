import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './AdminPlab1Tests.css';

const EMPTY_QUESTION = {
  examDay: 'DAY_1',
  blockNumber: 1,
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  optionE: '',
  correctOption: 'A',
  explanation: ''
};

const DAY_OPTIONS = [
  { value: 'DAY_1', label: 'Day 1 (FIP)' },
  { value: 'DAY_2', label: 'Day 2 (ACM + CCS)' }
];

const DAY_LABEL = {
  DAY_1: 'Day 1 (FIP)',
  DAY_2: 'Day 2 (ACM + CCS)'
};

const DAY_ORDER = {
  DAY_1: 1,
  DAY_2: 2
};

function AdminUSMLEStep3Pretest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'publish',
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    targetIndex: null
  });

  const [formData, setFormData] = useState({
    slug: 'usmle-step3-pretest',
    title: 'USMLE Step 3 Pre-Test',
    instructions:
      'Two-day exam. Day 1 (FIP): 6 blocks of approximately 38 to 40 MCQs. Day 2 (ACM): 6 blocks of approximately 30 MCQs plus CCS context. Breaks: 45 minutes each day.',
    questionTimeSeconds: 90,
    isPublished: false,
    questions: []
  });

  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);

  const optionKeys = useMemo(() => ['A', 'B', 'C', 'D', 'E'], []);
  const totalQuestions = formData.questions.length;
  const readyToPublish = totalQuestions > 0;

  const showNotification = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const explanationEditorModules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link'],
        ['clean']
      ]
    }),
    []
  );

  const explanationEditorFormats = useMemo(
    () => ['bold', 'italic', 'underline', 'list', 'bullet', 'blockquote', 'link'],
    []
  );

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      showNotification('Access denied. Admin only.', 'error');
      navigate('/');
      return;
    }

    fetchTest();
  }, [navigate]);

  const fetchTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/plab-tests/admin/usmle-step3-pretest`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        const test = data.data;
        setEditingTest(test);
        setFormData({
          slug: test.slug,
          title: test.title,
          instructions: test.instructions,
          questionTimeSeconds: test.questionTimeSeconds || 90,
          isPublished: test.isPublished,
          questions: (test.questions || []).map((question) => ({
            examDay: question.examDay || 'DAY_1',
            blockNumber: question.blockNumber || 1,
            questionText: question.questionText,
            optionA: question.options.find((option) => option.key === 'A')?.text || '',
            optionB: question.options.find((option) => option.key === 'B')?.text || '',
            optionC: question.options.find((option) => option.key === 'C')?.text || '',
            optionD: question.options.find((option) => option.key === 'D')?.text || '',
            optionE: question.options.find((option) => option.key === 'E')?.text || '',
            correctOption: question.correctOption,
            explanation: question.explanation || ''
          }))
        });
      }
    } catch (error) {
      console.error('Error loading USMLE Step 3 pretest:', error);
      showNotification('Failed to load USMLE Step 3 pretest', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'questionTimeSeconds' ? Number(value) : value
    }));
  };

  const handleQuestionFieldChange = (event) => {
    const { name, value } = event.target;
    setQuestionForm((prev) => ({
      ...prev,
      [name]: name === 'blockNumber' ? Number(value) : value
    }));
  };

  const handleExplanationChange = (value) => {
    setQuestionForm((prev) => ({ ...prev, explanation: value }));
  };

  const normalizeEditorHtml = (html = '') => {
    const plainText = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return plainText ? html.trim() : '';
  };

  const validateQuestionForm = () => {
    if (!questionForm.questionText.trim()) {
      showNotification('Question text is required.', 'error');
      return false;
    }

    if (!['DAY_1', 'DAY_2'].includes(questionForm.examDay)) {
      showNotification('Please select a valid exam day.', 'error');
      return false;
    }

    if (questionForm.blockNumber < 1 || questionForm.blockNumber > 6) {
      showNotification('Block number must be between 1 and 6 for each day.', 'error');
      return false;
    }

    for (const key of optionKeys) {
      if (!questionForm[`option${key}`].trim()) {
        showNotification(`Option ${key} is required.`, 'error');
        return false;
      }
    }

    return true;
  };

  const handleAddOrUpdateQuestion = () => {
    if (!validateQuestionForm()) {
      return;
    }

    const updatedQuestions = [...formData.questions];

    if (editingIndex === null) {
      updatedQuestions.push({ ...questionForm });
      showNotification('Question added.');
    } else {
      updatedQuestions[editingIndex] = { ...questionForm };
      showNotification(`Question ${editingIndex + 1} updated.`);
    }

    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
    setQuestionForm(EMPTY_QUESTION);
    setEditingIndex(null);
  };

  const handleEditQuestion = (index) => {
    setQuestionForm({ ...formData.questions[index] });
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = (index) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Delete Question',
      message: `Are you sure you want to delete Question ${index + 1}? This action cannot be undone.`,
      confirmLabel: 'Delete Question',
      targetIndex: index
    });
  };

  const confirmDeleteQuestion = () => {
    const index = confirmDialog.targetIndex;

    if (typeof index !== 'number' || index < 0 || index >= formData.questions.length) {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false, targetIndex: null }));
      return;
    }

    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));

    if (editingIndex === index) {
      setQuestionForm(EMPTY_QUESTION);
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex((prev) => prev - 1);
    }

    setConfirmDialog((prev) => ({ ...prev, isOpen: false, targetIndex: null }));
    showNotification(`Question ${index + 1} removed.`);
  };

  const handleOpenPublishDialog = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'publish',
      title: 'Publish USMLE Step 3 Pre-Test',
      message: `Publish the pre-test with ${totalQuestions} question${totalQuestions === 1 ? '' : 's'}? Students will see it immediately.`,
      confirmLabel: 'Yes, Publish Now',
      targetIndex: null
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, targetIndex: null }));
  };

  const handleCancelEdit = () => {
    setQuestionForm(EMPTY_QUESTION);
    setEditingIndex(null);
  };

  const handleSaveTest = async (publishNow = false) => {
    if (!readyToPublish) {
      showNotification('Please add at least one question before saving.', 'error');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        slug: 'usmle-step3-pretest',
        title: formData.title.trim(),
        instructions: formData.instructions.trim(),
        questionTimeSeconds: Number(formData.questionTimeSeconds) || 90,
        isPublished: publishNow,
        questions: formData.questions
          .map((question, index) => ({
            examDay: question.examDay || 'DAY_1',
            blockNumber: Number(question.blockNumber) || 1,
            questionText: question.questionText.trim(),
            options: optionKeys.map((key) => ({ key, text: question[`option${key}`].trim() })),
            correctOption: question.correctOption,
            explanation: normalizeEditorHtml(question.explanation),
            order: index + 1
          }))
          .sort((a, b) => {
            const dayDiff = (DAY_ORDER[a.examDay] || 99) - (DAY_ORDER[b.examDay] || 99);
            if (dayDiff !== 0) {
              return dayDiff;
            }

            if (a.blockNumber !== b.blockNumber) {
              return a.blockNumber - b.blockNumber;
            }

            return a.order - b.order;
          })
      };

      let endpoint = editingTest?._id
        ? `${API_BASE_URL}/api/plab-tests/${editingTest._id}`
        : `${API_BASE_URL}/api/plab-tests`;
      let method = editingTest?._id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Handle duplicate slug error - fetch existing test and retry with PUT
      if (!data.success && data.error && data.error.includes('slug already exists')) {
        try {
          const fetchResponse = await fetch(`${API_BASE_URL}/api/plab-tests/admin/usmle-step3-pretest`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const fetchData = await fetchResponse.json();
          if (fetchData.success && fetchData.data?._id) {
            // Found the existing test, retry with PUT
            const existingTest = fetchData.data;
            setEditingTest(existingTest);

            endpoint = `${API_BASE_URL}/api/plab-tests/${existingTest._id}`;
            method = 'PUT';

            const retryResponse = await fetch(endpoint, {
              method,
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            const retryData = await retryResponse.json();
            if (!retryData.success) {
              showNotification(retryData.error || 'Failed to save test', 'error');
              setSaving(false);
              return;
            }

            setEditingTest(retryData.data);
            setFormData((prev) => ({ ...prev, isPublished: Boolean(retryData.data?.isPublished) }));
            showNotification(publishNow ? 'USMLE Step 3 pretest published.' : 'USMLE Step 3 pretest draft saved.');
            setSaving(false);
            return;
          }
        } catch (retryError) {
          console.error('Error recovering from duplicate slug:', retryError);
          showNotification('Test exists but could not be updated. Please try again.', 'error');
          setSaving(false);
          return;
        }
      }

      if (!data.success) {
        showNotification(data.error || 'Failed to save test', 'error');
        return;
      }

      setEditingTest(data.data);
      setFormData((prev) => ({ ...prev, isPublished: Boolean(data.data?.isPublished) }));
      showNotification(publishNow ? 'USMLE Step 3 pretest published.' : 'USMLE Step 3 pretest draft saved.');
    } catch (error) {
      console.error('Error saving USMLE Step 3 pretest:', error);
      showNotification('Error saving test.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const dayCounts = useMemo(() => {
    const counts = { DAY_1: 0, DAY_2: 0 };

    formData.questions.forEach((question) => {
      const dayKey = question.examDay || 'DAY_1';
      counts[dayKey] = (counts[dayKey] || 0) + 1;
    });

    return counts;
  }, [formData.questions]);

  const questionsByDayAndBlock = useMemo(() => {
    const grouped = {
      DAY_1: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
      DAY_2: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    };

    formData.questions.forEach((question, originalIndex) => {
      const examDay = question.examDay || 'DAY_1';
      const blockNumber = Number(question.blockNumber) || 1;

      if (!grouped[examDay] || !grouped[examDay][blockNumber]) {
        return;
      }

      grouped[examDay][blockNumber].push({
        question,
        originalIndex,
        blockPosition: grouped[examDay][blockNumber].length + 1
      });
    });

    return grouped;
  }, [formData.questions]);

  const handleConfirmAction = async () => {
    if (confirmDialog.type === 'danger') {
      confirmDeleteQuestion();
      return;
    }

    if (confirmDialog.type === 'publish') {
      closeConfirmDialog();
      await handleSaveTest(true);
    }
  };

  if (loading) {
    return <div className="admin-plab-tests-loading">Loading USMLE Step 3 pretest...</div>;
  }

  return (
    <div className="admin-plab-tests-page">
      <div className="admin-tests-header">
        <div>
          <h1>Manage USMLE Step 3 Pre-Test</h1>
          <p className="admin-tests-subtitle">Add questions, answers, and explanations separately for Day 1 and Day 2.</p>
        </div>
        <button className="admin-tests-back" onClick={() => navigate('/admin/dashboard?section=usmle-admin')}>
          ← Back to USMLE Admin
        </button>
      </div>

      <section className="admin-tests-overview" aria-label="USMLE Step 3 pretest overview">
        <article className="overview-tile">
          <h3>Total Questions</h3>
          <p>{totalQuestions}</p>
        </article>
        <article className="overview-tile">
          <h3>Day 1 Questions</h3>
          <p>{dayCounts.DAY_1}</p>
        </article>
        <article className="overview-tile">
          <h3>Day 2 Questions</h3>
          <p>{dayCounts.DAY_2}</p>
        </article>
        <article className="overview-tile">
          <h3>Current Status</h3>
          <p className={`status-pill ${formData.isPublished ? 'live' : 'draft'}`}>
            {formData.isPublished ? 'Published' : 'Draft'}
          </p>
        </article>
      </section>

      <div className="admin-tests-grid">
        <section className="admin-tests-card">
          <h2>Pre-Test Settings</h2>
          <div className="admin-tests-form-group">
            <label>Page title</label>
            <input name="title" value={formData.title} onChange={handleMetaChange} />
          </div>
          <div className="admin-tests-form-group">
            <label>Instructions</label>
            <textarea name="instructions" rows={3} value={formData.instructions} onChange={handleMetaChange} />
          </div>
          <div className="admin-tests-form-group small">
            <label>Average time per question (seconds)</label>
            <input
              type="number"
              min="30"
              max="180"
              name="questionTimeSeconds"
              value={formData.questionTimeSeconds}
              onChange={handleMetaChange}
            />
          </div>

          <div className="admin-tests-row-actions">
            <button className="admin-tests-save" onClick={() => handleSaveTest(false)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button className="admin-tests-publish" onClick={handleOpenPublishDialog} disabled={saving || !readyToPublish}>
              {saving ? 'Publishing...' : 'Publish Pre-Test'}
            </button>
          </div>
        </section>

        <section className="admin-tests-card">
          <h2>{editingIndex === null ? 'Add Question' : `Edit Question ${editingIndex + 1}`}</h2>

          <div className="admin-tests-form-group small">
            <label>Exam Day</label>
            <select name="examDay" value={questionForm.examDay} onChange={handleQuestionFieldChange}>
              {DAY_OPTIONS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-tests-form-group small">
            <label>Block Number (1-6)</label>
            <select name="blockNumber" value={questionForm.blockNumber} onChange={handleQuestionFieldChange}>
              {[1, 2, 3, 4, 5, 6].map((block) => (
                <option key={block} value={block}>Block {block}</option>
              ))}
            </select>
          </div>

          <div className="admin-tests-form-group">
            <label>Question</label>
            <textarea
              name="questionText"
              rows={4}
              value={questionForm.questionText}
              onChange={handleQuestionFieldChange}
              placeholder="Write question stem"
            />
          </div>

          {optionKeys.map((key) => (
            <div key={key} className="admin-tests-form-group">
              <label>Option {key}</label>
              <input
                name={`option${key}`}
                value={questionForm[`option${key}`]}
                onChange={handleQuestionFieldChange}
                placeholder={`Enter option ${key}`}
              />
            </div>
          ))}

          <div className="admin-tests-form-group small">
            <label>Correct answer</label>
            <select name="correctOption" value={questionForm.correctOption} onChange={handleQuestionFieldChange}>
              {optionKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-tests-form-group">
            <label>Explanation</label>
            <ReactQuill
              theme="snow"
              value={questionForm.explanation}
              onChange={handleExplanationChange}
              modules={explanationEditorModules}
              formats={explanationEditorFormats}
              placeholder="Add explanation shown in review"
            />
          </div>

          <div className="admin-tests-row-actions">
            <button className="admin-tests-primary" onClick={handleAddOrUpdateQuestion}>
              {editingIndex === null ? 'Add Question' : 'Update Question'}
            </button>
            {editingIndex !== null && (
              <button className="admin-tests-secondary" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="admin-tests-card questions-list-card">
        <h2>Questions ({formData.questions.length})</h2>
        <p className="admin-tests-list-note">Questions are grouped separately by Day 1 and Day 2, then by block.</p>

        {formData.questions.length === 0 && <p className="admin-tests-empty">No questions added yet.</p>}

        {DAY_OPTIONS.map((day) => (
          <div key={day.value} className="admin-block-section">
            <h3>{day.label}</h3>

            {[1, 2, 3, 4, 5, 6].map((block) => {
              const blockQuestions = questionsByDayAndBlock[day.value]?.[block] || [];

              return (
                <div key={`${day.value}-${block}`} className="admin-block-section">
                  <h3>Block {block} ({blockQuestions.length})</h3>

                  {blockQuestions.length === 0 && (
                    <p className="admin-tests-empty">No questions in this block yet.</p>
                  )}

                  {blockQuestions.map(({ question, originalIndex, blockPosition }) => {
                    const correctAnswerText = question[`option${question.correctOption}`] || '';

                    return (
                      <article key={`${day.value}-${block}-${originalIndex}`} className="question-preview-card">
                        <div className="question-preview-header">
                          <strong>
                            {DAY_LABEL[question.examDay] || DAY_LABEL.DAY_1} - Block {block} - Q{blockPosition}. {question.questionText}
                          </strong>
                          <div className="question-preview-actions">
                            <button onClick={() => handleEditQuestion(originalIndex)}>Edit</button>
                            <button className="danger" onClick={() => handleDeleteQuestion(originalIndex)}>
                              Delete
                            </button>
                          </div>
                        </div>

                        <ul>
                          {optionKeys.map((key) => (
                            <li key={key} className={question.correctOption === key ? 'correct' : ''}>
                              {key}. {question[`option${key}`]}
                            </li>
                          ))}
                        </ul>

                        <p className="question-correct-answer">
                          Correct Answer: <strong>{question.correctOption}</strong>
                          {correctAnswerText ? ` - ${correctAnswerText}` : ''}
                        </p>

                        <div className="question-explanation-preview">
                          <p className="question-explanation-title">Explanation</p>
                          {question.explanation ? (
                            <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
                          ) : (
                            <p>Explanation not added.</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </section>

      {confirmDialog.isOpen && (
        <div className="admin-tests-confirm-overlay" role="presentation" onClick={closeConfirmDialog}>
          <section
            className={`admin-tests-confirm-card ${confirmDialog.type}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="admin-confirm-title">{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>

            <div className="admin-tests-confirm-actions">
              <button type="button" className="admin-tests-confirm-cancel" onClick={closeConfirmDialog}>
                Cancel
              </button>
              <button type="button" className="admin-tests-confirm-ok" onClick={handleConfirmAction}>
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}

      {showPopup && <div className={`admin-tests-popup ${popupType}`}>{popupMessage}</div>}
    </div>
  );
}

export default AdminUSMLEStep3Pretest;
