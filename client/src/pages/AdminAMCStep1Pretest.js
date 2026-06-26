import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './AdminPlab1Tests.css';

const EMPTY_QUESTION = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  explanation: '',
  imageUrl: ''
};

function AdminAMCStep1Pretest() {
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
    slug: 'amc-step1-pretest',
    title: 'AMC Step 1 Pretest (CAT)',
    instructions:
      'Duration 3.5 hours. 150 multiple-choice questions. Best-of-four format: select one best answer from four options.',
    questionTimeSeconds: 84,
    isPublished: false,
    questions: []
  });
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);

  const optionKeys = useMemo(() => ['A', 'B', 'C', 'D'], []);
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
      const response = await fetch(`${API_BASE_URL}/api/plab-tests/admin/amc-step1-pretest`, {
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
          questionTimeSeconds: test.questionTimeSeconds || 84,
          isPublished: test.isPublished,
          questions: (test.questions || []).map((question) => ({
            questionText: question.questionText,
            optionA: question.options.find((option) => option.key === 'A')?.text || '',
            optionB: question.options.find((option) => option.key === 'B')?.text || '',
            optionC: question.options.find((option) => option.key === 'C')?.text || '',
            optionD: question.options.find((option) => option.key === 'D')?.text || '',
            correctOption: question.correctOption,
            explanation: question.explanation || '',
            imageUrl: question.imageUrl || ''
          }))
        });
      }
    } catch (error) {
      console.error('Error loading AMC pretest:', error);
      showNotification('Failed to load AMC pretest', 'error');
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
      [name]: value
    }));
  };

  const handleExplanationChange = (value) => {
    setQuestionForm((prev) => ({ ...prev, explanation: value }));
  };

  const handleQuestionImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setQuestionForm((prev) => ({
        ...prev,
        imageUrl: String(reader.result || '')
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleClearQuestionImage = () => {
    setQuestionForm((prev) => ({
      ...prev,
      imageUrl: ''
    }));
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
      title: 'Publish AMC Step 1 Pretest',
      message: `Publish the pretest with ${totalQuestions} question${totalQuestions === 1 ? '' : 's'}? Students will see it immediately.`,
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
        slug: 'amc-step1-pretest',
        title: formData.title.trim(),
        instructions: formData.instructions.trim(),
        questionTimeSeconds: Number(formData.questionTimeSeconds) || 84,
        isPublished: publishNow,
        questions: formData.questions.map((question, index) => ({
          blockNumber: 1,
          questionText: question.questionText.trim(),
          options: optionKeys.map((key) => ({ key, text: question[`option${key}`].trim() })),
          correctOption: question.correctOption,
          explanation: normalizeEditorHtml(question.explanation),
          imageUrl: question.imageUrl || '',
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
      setFormData((prev) => ({ ...prev, isPublished: Boolean(data.data?.isPublished) }));
      showNotification(publishNow ? 'AMC pretest published.' : 'AMC pretest draft saved.');
    } catch (error) {
      console.error('Error saving AMC pretest:', error);
      showNotification('Error saving test.', 'error');
    } finally {
      setSaving(false);
    }
  };

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
    return <div className="admin-plab-tests-loading">Loading AMC Step 1 pretest...</div>;
  }

  return (
    <div className="admin-plab-tests-page">
      <div className="admin-tests-header">
        <div>
          <h1>Manage AMC Step 1 Pretest (CAT)</h1>
          <p className="admin-tests-subtitle">Add best-of-four questions, correct answers, and explanations.</p>
        </div>
        <button className="admin-tests-back" onClick={() => navigate('/admin/dashboard?section=amc-admin')}>
          ← Back to AMC Admin
        </button>
      </div>

      <section className="admin-tests-overview" aria-label="AMC pretest overview">
        <article className="overview-tile">
          <h3>Total Questions</h3>
          <p>{totalQuestions}</p>
        </article>
        <article className="overview-tile">
          <h3>Question Type</h3>
          <p>Best-of-Four</p>
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
          <h2>Pretest Settings</h2>
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
              {saving ? 'Publishing...' : 'Publish Pretest'}
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
              placeholder="Write clinical scenario stem"
            />
          </div>

          <div className="admin-tests-form-group">
            <label>Question image (optional)</label>
            <input type="file" accept="image/*" onChange={handleQuestionImageChange} />
            {questionForm.imageUrl && (
              <div className="question-image-preview-wrap">
                <img src={questionForm.imageUrl} alt="Question preview" className="question-image-preview" />
                <button type="button" className="admin-tests-secondary" onClick={handleClearQuestionImage}>
                  Remove image
                </button>
              </div>
            )}
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
              placeholder="Add explanation shown to users after submission"
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

        {formData.questions.length === 0 && <p className="admin-tests-empty">No questions added yet.</p>}

        {formData.questions.map((question, index) => {
          const correctAnswerText = question[`option${question.correctOption}`] || '';

          return (
            <article key={`q-${index}`} className="question-preview-card">
              <div className="question-preview-header">
                <strong>Q{index + 1}. {question.questionText}</strong>
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

              {question.imageUrl && (
                <div className="question-image-preview-block">
                  <p className="question-explanation-title">Image</p>
                  <img src={question.imageUrl} alt={`Question ${index + 1} preview`} className="question-image-preview" />
                </div>
              )}
            </article>
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

export default AdminAMCStep1Pretest;
