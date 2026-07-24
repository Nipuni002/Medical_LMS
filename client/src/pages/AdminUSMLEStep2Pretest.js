import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './AdminPlab1Tests.css';

const EMPTY_QUESTION = {
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

function AdminUSMLEStep2Pretest() {
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
    slug: 'usmle-step2-ck-pretest',
    title: 'USMLE Step 2 CK Pre-Test',
    instructions:
      '8 blocks, each up to 40 questions. 60 minutes per block. Total testing time 8 hours. Break time is 45 minutes and can be extended if you skip the tutorial.',
    questionTimeSeconds: 90,
    isPublished: false,
    questions: []
  });
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);
  const [bulkOptionsText, setBulkOptionsText] = useState('');

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
      const response = await fetch(`${API_BASE_URL}/api/plab-tests/admin/usmle-step2-ck-pretest`, {
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
      console.error('Error loading USMLE pretest:', error);
      showNotification('Failed to load USMLE pretest', 'error');
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

    if (questionForm.blockNumber < 1 || questionForm.blockNumber > 8) {
      showNotification('Block number must be between 1 and 8.', 'error');
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

  const parseBulkOptions = (text) => {
    const options = {};
    optionKeys.forEach(k => options[k] = '');
    if (!text || !text.trim()) return options;

    const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    let prefixMatched = false;
    const prefixRegexStr = `^([${optionKeys.join('')}])[\\.\\)\\-\\s\\:]\\s*(.*)$`;
    const regex = new RegExp(prefixRegexStr, 'i');

    for (const line of lines) {
      if (regex.test(line)) {
        prefixMatched = true;
        break;
      }
    }

    if (prefixMatched) {
      lines.forEach((line) => {
        const match = line.match(regex);
        if (match) {
          const key = match[1].toUpperCase();
          const content = match[2].trim();
          if (options.hasOwnProperty(key)) {
            options[key] = options[key] ? options[key] + ' ' + content : content;
          }
        }
      });
    } else {
      for (let i = 0; i < Math.min(lines.length, optionKeys.length); i++) {
        options[optionKeys[i]] = lines[i];
      }
    }

    return options;
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
    setBulkOptionsText('');
    setEditingIndex(null);
  };

  const handleEditQuestion = (index) => {
    setQuestionForm({ ...formData.questions[index] });
    setBulkOptionsText('');
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
      setBulkOptionsText('');
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
      title: 'Publish USMLE Step 2 CK Pre-Test',
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
    setBulkOptionsText('');
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
        slug: 'usmle-step2-ck-pretest',
        title: formData.title.trim(),
        instructions: formData.instructions.trim(),
        questionTimeSeconds: Number(formData.questionTimeSeconds) || 90,
        isPublished: publishNow,
        questions: formData.questions
          .map((question, index) => ({
            blockNumber: Number(question.blockNumber) || 1,
            questionText: question.questionText.trim(),
            options: optionKeys.map((key) => ({ key, text: question[`option${key}`].trim() })),
            correctOption: question.correctOption,
            explanation: normalizeEditorHtml(question.explanation),
            order: index + 1
          }))
          .sort((a, b) => {
            if (a.blockNumber !== b.blockNumber) {
              return a.blockNumber - b.blockNumber;
            }
            return a.order - b.order;
          })
      };

      const endpoint = editingTest?._id
        ? `${API_BASE_URL}/api/plab-tests/${editingTest._id}`
        : `${API_BASE_URL}/api/plab-tests`;

      const method = editingTest?._id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        showNotification(data.error || 'Failed to save test', 'error');
        return;
      }

      setEditingTest(data.data);
      setFormData((prev) => ({ ...prev, isPublished: Boolean(data.data?.isPublished) }));

      showNotification(publishNow ? 'USMLE pretest published.' : 'USMLE pretest draft saved.');
    } catch (error) {
      console.error('Error saving USMLE pretest:', error);
      showNotification('Error saving test.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const blockCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    formData.questions.forEach((question) => {
      const key = Number(question.blockNumber) || 1;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [formData.questions]);

  const questionsByBlock = useMemo(() => {
    const grouped = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };

    formData.questions.forEach((question, originalIndex) => {
      const blockNumber = Number(question.blockNumber) || 1;
      if (!grouped[blockNumber]) {
        return;
      }

      grouped[blockNumber].push({
        question,
        originalIndex,
        blockPosition: grouped[blockNumber].length + 1
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
    return <div className="admin-plab-tests-loading">Loading USMLE Step 2 CK pretest...</div>;
  }

  return (
    <div className="admin-plab-tests-page">
      <div className="admin-tests-header">
        <div>
          <h1>Manage USMLE Step 2 CK Pre-Test</h1>
          <p className="admin-tests-subtitle">Add questions, answers, explanations, and assign each question to one of 8 blocks.</p>
        </div>
        <button className="admin-tests-back" onClick={() => navigate('/admin/dashboard?section=usmle-admin')}>
          ← Back to USMLE Admin
        </button>
      </div>

      <section className="admin-tests-overview" aria-label="USMLE pretest overview">
        <article className="overview-tile">
          <h3>Total Questions</h3>
          <p>{totalQuestions}</p>
        </article>
        <article className="overview-tile">
          <h3>Blocks Covered</h3>
          <p>{Object.values(blockCounts).filter((count) => count > 0).length}/8</p>
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
            <label>Block Number (1-8)</label>
            <select name="blockNumber" value={questionForm.blockNumber} onChange={handleQuestionFieldChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((block) => (
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

          <div className="admin-tests-form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Paste options at once</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                Format: A. content (or one option per line)
              </span>
            </label>
            <textarea
              rows={3}
              value={bulkOptionsText}
              placeholder={optionKeys.map(k => `${k}. Option ${k} text`).join('\n')}
              onChange={(e) => {
                const val = e.target.value;
                setBulkOptionsText(val);
                const parsed = parseBulkOptions(val);
                setQuestionForm((prev) => {
                  const updated = { ...prev };
                  optionKeys.forEach((key) => {
                    if (parsed[key] !== undefined) {
                      updated[`option${key}`] = parsed[key] || prev[`option${key}`];
                    }
                  });
                  return updated;
                });
              }}
              style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}
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
        <p className="admin-tests-list-note">Questions are grouped by block for the 8-block exam flow.</p>

        {formData.questions.length === 0 && <p className="admin-tests-empty">No questions added yet.</p>}

        {[1, 2, 3, 4, 5, 6, 7, 8].map((block) => {
          const blockQuestions = questionsByBlock[block] || [];

          return (
            <div key={block} className="admin-block-section">
              <h3>Block {block} ({blockQuestions.length})</h3>

              {blockQuestions.length === 0 && (
                <p className="admin-tests-empty">No questions in this block yet.</p>
              )}

              {blockQuestions.map(({ question, originalIndex, blockPosition }) => {
                const correctAnswerText = question[`option${question.correctOption}`] || '';

                return (
                  <article key={`${block}-${originalIndex}`} className="question-preview-card">
                    <div className="question-preview-header">
                      <strong>Q{blockPosition}. {question.questionText}</strong>
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

export default AdminUSMLEStep2Pretest;
