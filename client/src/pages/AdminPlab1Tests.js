import React, { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import API_BASE_URL from '../config/api';
import './AdminPlab1Tests.css';

const EMPTY_QUESTION = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  optionE: '',
  correctOption: 'A',
  explanation: ''
};

const AdminPlab1Tests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'OK',
    type: 'info',
    onConfirm: null
  });
  const [formData, setFormData] = useState({
    slug: 'plab1-sba',
    title: 'Revision questions',
    instructions:
      'Tick the most appropriate answer. Each question has 1 minute to answer. When time expires question page automatically goes to review page.',
    questionTimeSeconds: 60,
    isPublished: false,
    questions: []
  });
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);

  const optionKeys = useMemo(() => ['A', 'B', 'C', 'D', 'E'], []);
  const totalQuestions = formData.questions.length;
  const readyToPublish = totalQuestions > 0;
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

  const showNotification = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const openConfirmDialog = ({ title, message, confirmLabel = 'OK', type = 'info', onConfirm }) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmLabel,
      type,
      onConfirm
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      confirmLabel: 'OK',
      type: 'info',
      onConfirm: null
    });
  };

  const handleConfirmOk = () => {
    const action = confirmDialog.onConfirm;
    closeConfirmDialog();
    if (typeof action === 'function') {
      action();
    }
  };

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
      const response = await fetch(`${API_BASE_URL}/api/plab-tests/admin/plab1-sba`, {
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
          questionTimeSeconds: test.questionTimeSeconds || 60,
          isPublished: test.isPublished,
          questions: (test.questions || []).map((question) => ({
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
      console.error('Error loading PLAB test:', error);
      showNotification('Failed to load PLAB-1 test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionFieldChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeEditorHtml = (html = '') => {
    const plainText = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return plainText ? html.trim() : '';
  };

  const handleExplanationChange = (value) => {
    setQuestionForm((prev) => ({ ...prev, explanation: value }));
  };

  const validateQuestionForm = () => {
    if (!questionForm.questionText.trim()) {
      showNotification('Question text is required.', 'error');
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
      showNotification('Question added to draft test.');
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
    openConfirmDialog({
      title: 'Delete Question',
      message: `Are you sure you want to delete Question ${index + 1}? This action cannot be undone.`,
      confirmLabel: 'Yes, Delete',
      type: 'danger',
      onConfirm: () => {
        const updatedQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, questions: updatedQuestions }));

        if (editingIndex === index) {
          setQuestionForm(EMPTY_QUESTION);
          setEditingIndex(null);
        }

        showNotification(`Question ${index + 1} removed.`);
      }
    });
  };

  const handleCancelEdit = () => {
    setQuestionForm(EMPTY_QUESTION);
    setEditingIndex(null);
  };

  const handleSaveTest = async (publishNow = false, bypassConfirm = false) => {
    if (!readyToPublish) {
      showNotification('Please add at least one question before saving.', 'error');
      return;
    }

    if (publishNow && !bypassConfirm) {
      openConfirmDialog({
        title: 'Publish Final Test',
        message: `Publish PLAB-1 final test now with ${totalQuestions} question${totalQuestions === 1 ? '' : 's'}? Students will see these questions immediately.`,
        confirmLabel: 'Publish Now',
        type: 'publish',
        onConfirm: () => handleSaveTest(true, true)
      });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        slug: 'plab1-sba',
        title: formData.title.trim(),
        instructions: formData.instructions.trim(),
        questionTimeSeconds: Number(formData.questionTimeSeconds) || 60,
        isPublished: publishNow,
        questions: formData.questions.map((question, index) => ({
          questionText: question.questionText.trim(),
          options: optionKeys.map((key) => ({ key, text: question[`option${key}`].trim() })),
          correctOption: question.correctOption,
          explanation: normalizeEditorHtml(question.explanation),
          order: index + 1
        }))
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
      setFormData((prev) => ({
        ...prev,
        isPublished: Boolean(data.data?.isPublished)
      }));

      showNotification(
        publishNow
          ? 'Final test published successfully. Students can now access all questions.'
          : 'Draft saved successfully. Test remains unpublished.',
        'success'
      );
    } catch (error) {
      console.error('Error saving PLAB test:', error);
      showNotification('Error saving test.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-plab-tests-loading">Loading...</div>;
  }

  return (
    <div className="admin-plab-tests-page">
      <div className="admin-tests-header">
        <div>
          <h1>Manage PLAB-1 Tests</h1>
          <p className="admin-tests-subtitle">Build questions, save draft updates, then publish final test in one click.</p>
        </div>
        <button className="admin-tests-back" onClick={() => navigate('/admin/dashboard?section=plab-admin')}>
          ← Back to PLAB Admin Section
        </button>
      </div>

      <section className="admin-tests-overview" aria-label="PLAB test overview">
        <article className="overview-tile">
          <h3>Total Questions</h3>
          <p>{totalQuestions}</p>
        </article>
        <article className="overview-tile">
          <h3>Question Timer</h3>
          <p>{formData.questionTimeSeconds}s each</p>
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
          <h2>Test Settings</h2>
          <div className="admin-tests-form-group">
            <label>Page title</label>
            <input name="title" value={formData.title} onChange={handleMetaChange} />
          </div>
          <div className="admin-tests-form-group">
            <label>Instructions</label>
            <textarea
              name="instructions"
              rows={3}
              value={formData.instructions}
              onChange={handleMetaChange}
            />
          </div>
          <div className="admin-tests-form-group small">
            <label>Time per question (seconds)</label>
            <input
              type="number"
              min="15"
              max="300"
              name="questionTimeSeconds"
              value={formData.questionTimeSeconds}
              onChange={handleMetaChange}
            />
          </div>
          <div className="admin-tests-hint-box">
            Save Draft keeps the test private. Publish Final Test makes all questions visible to students.
          </div>
          <div className="admin-tests-row-actions">
            <button className="admin-tests-save" onClick={() => handleSaveTest(false)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              className="admin-tests-publish"
              onClick={() => handleSaveTest(true)}
              disabled={saving || !readyToPublish}
            >
              {saving ? 'Publishing...' : 'Publish Final Test'}
            </button>
          </div>
        </section>

        <section className="admin-tests-card">
          <h2>{editingIndex === null ? 'Add Question' : `Edit Question ${editingIndex + 1}`}</h2>
          <div className="admin-tests-form-group">
            <label>Question</label>
            <textarea
              name="questionText"
              rows={4}
              value={questionForm.questionText}
              onChange={handleQuestionFieldChange}
              placeholder="Write the clinical scenario and question"
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
            <select
              name="correctOption"
              value={questionForm.correctOption}
              onChange={handleQuestionFieldChange}
            >
              {optionKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-tests-form-group">
            <label>Explanation (optional)</label>
            <ReactQuill
              theme="snow"
              value={questionForm.explanation}
              onChange={handleExplanationChange}
              modules={explanationEditorModules}
              formats={explanationEditorFormats}
              placeholder="Add explanation for review page"
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
        <p className="admin-tests-list-note">Review each question before final publish.</p>

        {formData.questions.length === 0 && (
          <p className="admin-tests-empty">No questions added yet.</p>
        )}

        {formData.questions.map((question, index) => (
          <article key={`${index}-${question.questionText.slice(0, 10)}`} className="question-preview-card">
            <div className="question-preview-header">
              <strong>{index + 1}. {question.questionText}</strong>
              <div className="question-preview-actions">
                <button onClick={() => handleEditQuestion(index)}>Edit</button>
                <button className="danger" onClick={() => handleDeleteQuestion(index)}>
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
          </article>
        ))}
      </section>

      {showPopup && <div className={`admin-tests-popup ${popupType}`}>{popupMessage}</div>}

      {confirmDialog.open && (
        <div className="admin-tests-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-tests-confirm-title">
          <div className={`admin-tests-confirm-card ${confirmDialog.type}`}>
            <h3 id="admin-tests-confirm-title">{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="admin-tests-confirm-actions">
              <button type="button" className="admin-tests-confirm-cancel" onClick={closeConfirmDialog}>
                Cancel
              </button>
              <button type="button" className="admin-tests-confirm-ok" onClick={handleConfirmOk}>
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlab1Tests;
