import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminTheoryContent.css';

const getStepLabel = (step) => {
  if (step === 'STEP_1') return 'STEP 1 (Theory)';
  if (step === 'STEP_2') return 'STEP 2 (Clinical)';
  return step || 'NExT';
};

function AdminNEXTSubjectContent() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const [editTopicIndex, setEditTopicIndex] = useState(null);
  const [deleteTopicIndex, setDeleteTopicIndex] = useState(null);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    videoLink: '',
    pdfUrl: '',
    pdfs: []
  });
  const [editTopic, setEditTopic] = useState({
    title: '',
    content: '',
    videoLink: '',
    pdfUrl: '',
    pdfs: []
  });
  const [formData, setFormData] = useState({
    title: '',
    topics: [],
    isPublished: true
  });

  // MCQ Modal State
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [mcqTopicIndex, setMcqTopicIndex] = useState(null);
  const [mcqSectionsList, setMcqSectionsList] = useState([]); // [{ title: 'Section A', mcqs: [...] }]
  const [activeMcqSectionIndex, setActiveMcqSectionIndex] = useState(null); // null = sections list, number = questions in section
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [editingMcqIndex, setEditingMcqIndex] = useState(null);
  const [mcqForm, setMcqForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: 0,
    explanation: ''
  });

  const getTopicPreviewText = (html = '') => {
    const plainText = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!plainText) return 'No content added yet.';
    if (plainText.length <= 180) return plainText;
    return `${plainText.slice(0, 180)}...`;
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean']
    ]
  }), []);

  useEffect(() => {
    checkAuth();
    fetchInitialData();
  }, [subjectId]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const backToStepPage = () => {
    navigate('/admin/subjects-content');
  };

  const fetchInitialData = async () => {
    if (!subjectId) {
      navigate('/admin/next-content');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/next-subjects`);
      const subjects = await response.json();
      const subject = subjects.find((item) => item._id === subjectId);

      if (!subject) {
        showNotification('Selected subject not found', 'error');
        navigate('/admin/next-content');
        return;
      }

      setSelectedSubject(subject);
      await fetchContentForSubject(subjectId, subject.name);
    } catch (error) {
      console.error('Error loading subject:', error);
      showNotification('Error loading subject details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchContentForSubject = async (id, subjectName = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/next-theory-content/subject/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (result.success && result.data) {
        setContent(result.data);
        setFormData({
          title: result.data.title || subjectName,
          topics: result.data.topics || [],
          isPublished: result.data.isPublished
        });
      } else {
        setContent(null);
        setFormData({
          title: subjectName,
          topics: [],
          isPublished: true
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(null);
      setFormData({
        title: subjectName,
        topics: [],
        isPublished: true
      });
    }
  };

  const persistContent = async (nextTopics, successMessage) => {
    if (!selectedSubject) {
      showNotification('Please select a subject', 'error');
      return false;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = content
        ? `${API_BASE_URL}/api/next-theory-content/${content._id}`
        : `${API_BASE_URL}/api/next-theory-content`;

      const method = content ? 'PUT' : 'POST';

      const normalizedFormData = {
        ...formData,
        title: selectedSubject.name,
        topics: nextTopics,
        isPublished: formData.isPublished ?? true
      };

      const payload = content
        ? normalizedFormData
        : { ...normalizedFormData, subjectId: selectedSubject._id };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        const updatedTopics = result.data?.topics || nextTopics;
        setContent(result.data);
        setFormData((prev) => ({
          ...prev,
          title: result.data?.title || normalizedFormData.title,
          topics: updatedTopics,
          isPublished: result.data?.isPublished ?? normalizedFormData.isPublished
        }));
        if (successMessage) {
          showNotification(successMessage, 'success');
        }
        return true;
      }

      showNotification(result.message || 'Error saving content', 'error');
      return false;
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Error saving content', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addTopic = () => {
    setShowAddTopicModal(true);
    setNewTopic({
      title: '',
      content: '',
      videoLink: ''
    });
  };

  const handleAddTopicConfirm = async () => {
    if (!newTopic.title.trim()) {
      showNotification('Topic title is required', 'error');
      return;
    }
    if (!newTopic.content.trim()) {
      showNotification('Topic content is required', 'error');
      return;
    }

    const newTopics = [
      ...formData.topics,
      {
        title: newTopic.title,
        content: newTopic.content,
        videoLink: newTopic.videoLink,
        pdfUrl: (newTopic.pdfUrl || '').trim(),
        pdfs: newTopic.pdfs || [],
        order: formData.topics.length,
        mcqs: [],
        mcqSections: []
      }
    ];

    const saved = await persistContent(newTopics, 'Topic added successfully!');
    if (!saved) return;

    setShowAddTopicModal(false);
    setNewTopic({ title: '', content: '', videoLink: '', pdfUrl: '', pdfs: [] });
  };

  const handleAddTopicCancel = () => {
    setShowAddTopicModal(false);
    setNewTopic({ title: '', content: '', videoLink: '', pdfUrl: '', pdfs: [] });
  };

  // MCQ Section Handlers
  const openMcqModal = (index) => {
    const topic = formData.topics[index];
    if (!topic) return;

    setMcqTopicIndex(index);
    
    // Auto-migrate legacy mcqs if present and no mcqSections exist
    let sections = topic.mcqSections ? JSON.parse(JSON.stringify(topic.mcqSections)) : [];
    if (sections.length === 0 && topic.mcqs && topic.mcqs.length > 0) {
      sections = [{ title: 'General Practice', mcqs: JSON.parse(JSON.stringify(topic.mcqs)) }];
    }
    
    setMcqSectionsList(sections);
    setActiveMcqSectionIndex(null);
    setNewSectionTitle('');
    setEditingSectionIndex(null);
    setEditingSectionTitle('');

    // Reset MCQ question form
    setEditingMcqIndex(null);
    setMcqForm({
      question: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    });
    setShowMcqModal(true);
  };

  const closeMcqModal = () => {
    setShowMcqModal(false);
    setMcqTopicIndex(null);
    setMcqSectionsList([]);
    setActiveMcqSectionIndex(null);
    setNewSectionTitle('');
    setEditingSectionIndex(null);
    setEditingSectionTitle('');
    setEditingMcqIndex(null);
    setMcqForm({
      question: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    });
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      showNotification('Section title is required', 'error');
      return;
    }
    const newSection = {
      title: newSectionTitle.trim(),
      mcqs: []
    };
    setMcqSectionsList([...mcqSectionsList, newSection]);
    setNewSectionTitle('');
    showNotification('MCQ Section added', 'success');
  };

  const handleStartRenameSection = (idx) => {
    setEditingSectionIndex(idx);
    setEditingSectionTitle(mcqSectionsList[idx].title);
  };

  const handleSaveRenameSection = (idx) => {
    if (!editingSectionTitle.trim()) {
      showNotification('Section title cannot be empty', 'error');
      return;
    }
    const updated = [...mcqSectionsList];
    updated[idx].title = editingSectionTitle.trim();
    setMcqSectionsList(updated);
    setEditingSectionIndex(null);
    setEditingSectionTitle('');
    showNotification('Section renamed', 'success');
  };

  const handleDeleteSection = (idx) => {
    setMcqSectionsList(mcqSectionsList.filter((_, i) => i !== idx));
    showNotification('Section deleted', 'success');
    if (activeMcqSectionIndex === idx) {
      setActiveMcqSectionIndex(null);
    }
  };

  const handleAddOptionField = () => {
    if (mcqForm.options.length >= 6) return;
    setMcqForm((prev) => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOptionField = (optIndex) => {
    if (mcqForm.options.length <= 2) return;
    setMcqForm((prev) => {
      const updatedOptions = prev.options.filter((_, i) => i !== optIndex);
      let updatedCorrect = prev.correctOption;
      if (updatedCorrect >= updatedOptions.length) {
        updatedCorrect = updatedOptions.length - 1;
      }
      return {
        ...prev,
        options: updatedOptions,
        correctOption: updatedCorrect
      };
    });
  };

  const handleSaveMcqItem = () => {
    if (activeMcqSectionIndex === null) return;
    if (!mcqForm.question.trim()) {
      showNotification('Question stem is required', 'error');
      return;
    }
    const filledOptions = mcqForm.options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    if (filledOptions.length < 2) {
      showNotification('At least 2 options are required', 'error');
      return;
    }

    const newMcq = {
      question: mcqForm.question.trim(),
      options: filledOptions,
      correctOption: Math.min(mcqForm.correctOption, filledOptions.length - 1),
      explanation: mcqForm.explanation.trim()
    };

    const updatedSections = [...mcqSectionsList];
    const currentMcqs = updatedSections[activeMcqSectionIndex].mcqs ? [...updatedSections[activeMcqSectionIndex].mcqs] : [];

    if (editingMcqIndex !== null) {
      currentMcqs[editingMcqIndex] = newMcq;
      showNotification('MCQ updated in section', 'success');
    } else {
      currentMcqs.push(newMcq);
      showNotification('MCQ added to section', 'success');
    }

    updatedSections[activeMcqSectionIndex].mcqs = currentMcqs;
    setMcqSectionsList(updatedSections);

    // Reset MCQ form
    setEditingMcqIndex(null);
    setMcqForm({
      question: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    });
  };

  const handleEditMcqItem = (index) => {
    if (activeMcqSectionIndex === null) return;
    const target = mcqSectionsList[activeMcqSectionIndex].mcqs[index];
    if (!target) return;
    setEditingMcqIndex(index);
    setMcqForm({
      question: target.question || '',
      options: target.options ? [...target.options] : ['', '', '', ''],
      correctOption: target.correctOption || 0,
      explanation: target.explanation || ''
    });
  };

  const handleDeleteMcqItem = (index) => {
    if (activeMcqSectionIndex === null) return;
    const updatedSections = [...mcqSectionsList];
    const currentMcqs = updatedSections[activeMcqSectionIndex].mcqs.filter((_, i) => i !== index);
    updatedSections[activeMcqSectionIndex].mcqs = currentMcqs;
    setMcqSectionsList(updatedSections);
    showNotification('MCQ deleted', 'success');

    if (editingMcqIndex === index) {
      setEditingMcqIndex(null);
      setMcqForm({
        question: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: ''
      });
    }
  };

  const handleSaveAllMcqs = async () => {
    if (mcqTopicIndex === null || !formData.topics[mcqTopicIndex]) return;

    const newTopics = [...formData.topics];
    newTopics[mcqTopicIndex] = {
      ...newTopics[mcqTopicIndex],
      mcqSections: mcqSectionsList,
      mcqs: [] // clean legacy mcqs list
    };

    const saved = await persistContent(newTopics, 'Section MCQs saved successfully!');
    if (!saved) return;

    closeMcqModal();
  };

  const openEditTopicModal = (index) => {
    const topic = formData.topics[index];
    if (!topic) return;

    setEditTopicIndex(index);
    setEditTopic({
      title: topic.title || '',
      content: topic.content || '',
      videoLink: topic.videoLink || '',
      pdfUrl: topic.pdfUrl || '',
      pdfs: topic.pdfs || []
    });
    setShowEditTopicModal(true);
  };

  const handleEditTopicCancel = () => {
    setShowEditTopicModal(false);
    setEditTopicIndex(null);
    setEditTopic({ title: '', content: '', videoLink: '', pdfUrl: '', pdfs: [] });
  };

  const handleEditTopicConfirm = async () => {
    if (!editTopic.title.trim()) {
      showNotification('Topic title is required', 'error');
      return;
    }
    if (!editTopic.content.trim()) {
      showNotification('Topic content is required', 'error');
      return;
    }
    if (editTopicIndex === null || !formData.topics[editTopicIndex]) {
      showNotification('Topic not found', 'error');
      return;
    }

    const newTopics = [...formData.topics];
    const existingTopic = newTopics[editTopicIndex];
    newTopics[editTopicIndex] = {
      ...existingTopic,
      title: editTopic.title,
      content: editTopic.content,
      videoLink: editTopic.videoLink,
      pdfUrl: (editTopic.pdfUrl || '').trim(),
      pdfs: editTopic.pdfs || []
    };

    const saved = await persistContent(newTopics, 'Topic updated successfully!');
    if (!saved) return;

    setShowEditTopicModal(false);
    setEditTopicIndex(null);
    setEditTopic({ title: '', content: '', videoLink: '', pdfUrl: '', pdfs: [] });
  };

  const openDeleteTopicModal = (index) => {
    setDeleteTopicIndex(index);
    setShowDeleteTopicModal(true);
  };

  const handleDeleteTopicCancel = () => {
    setShowDeleteTopicModal(false);
    setDeleteTopicIndex(null);
  };

  const removeTopic = async (index) => {
    const newTopics = formData.topics
      .filter((_, i) => i !== index)
      .map((topic, i) => ({ ...topic, order: i }));

    return persistContent(newTopics, 'Topic deleted successfully!');
  };

  const handleDeleteTopicConfirm = async () => {
    if (deleteTopicIndex === null) return;

    const saved = await removeTopic(deleteTopicIndex);
    if (!saved) return;

    setShowDeleteTopicModal(false);
    setDeleteTopicIndex(null);
  };

  const moveTopicUp = async (index) => {
    if (index === 0) return;
    const newTopics = [...formData.topics];
    [newTopics[index], newTopics[index - 1]] = [newTopics[index - 1], newTopics[index]];
    newTopics.forEach((topic, i) => {
      topic.order = i;
    });
    await persistContent(newTopics, 'Topic order updated successfully!');
  };

  const moveTopicDown = async (index) => {
    if (index === formData.topics.length - 1) return;
    const newTopics = [...formData.topics];
    [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
    newTopics.forEach((topic, i) => {
      topic.order = i;
    });
    await persistContent(newTopics, 'Topic order updated successfully!');
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!selectedSubject) {
    return (
      <div className="admin-theory-content">
        <div className="admin-header">
          <h1>Manage NExT Subject Content</h1>
          <button onClick={backToStepPage} className="back-button">
            ← Back to Subjects
          </button>
        </div>
        <div className="content-form-container">
          <p className="no-topics">Subject not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theory-content">
      <div className="admin-header">
        <h1>Manage NExT Subject Content</h1>
        <button onClick={backToStepPage} className="back-button">
          ← Back to Subjects
        </button>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="content-form-container">
        <div className="subject-selector">
          <div className="admin-subject-bank-header">
            <h2>{selectedSubject.name}</h2>
            <p>{getStepLabel(selectedSubject.step)} | Add or update this subject content below.</p>
          </div>
        </div>

        <div className="theory-content-form">
          <div className="form-section topics-section">
            <div className="section-header">
              <h2>Topics</h2>
              <button type="button" onClick={addTopic} className="add-topic-btn" disabled={saving}>
                + Add Topic
              </button>
            </div>

            {formData.topics.length === 0 ? (
              <p className="no-topics">No topics added yet. Click "Add Topic" to start.</p>
            ) : (
              <div className="topics-list">
                {formData.topics.map((topic, index) => (
                  <div key={index} className="topic-card">
                    <div className="topic-header">
                      <h3>Topic {index + 1}</h3>
                      <div className="topic-actions">
                        <button
                          type="button"
                          onClick={() => moveTopicUp(index)}
                          disabled={index === 0 || saving}
                          className="move-btn"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTopicDown(index)}
                          disabled={index === formData.topics.length - 1 || saving}
                          className="move-btn"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => openMcqModal(index)}
                          className="mcq-manage-btn"
                          title="Manage MCQ Sections"
                          disabled={saving}
                        >
                          📝 MCQs ({topic.mcqSections?.length || (topic.mcqs?.length ? 1 : 0)} Sec)
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditTopicModal(index)}
                          disabled={saving}
                          className="update-btn"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteTopicModal(index)}
                          disabled={saving}
                          className="remove-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="topic-summary">
                      <p><strong>Title:</strong> {topic.title || 'Untitled topic'}</p>
                      <p><strong>Content:</strong> {getTopicPreviewText(topic.content)}</p>
                      <p><strong>Video:</strong> {topic.videoLink || 'No video link'}</p>
                      <p>
                        <strong>MCQ Sections: </strong> 
                        <span className="mcq-count-tag">
                          {topic.mcqSections?.length || (topic.mcqs?.length ? 1 : 0)} Sec (
                          {topic.mcqSections 
                            ? topic.mcqSections.reduce((acc, s) => acc + (s.mcqs?.length || 0), 0) 
                            : (topic.mcqs?.length || 0)} MCQs)
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddTopicModal && (
        <div className="modal-overlay" onClick={handleAddTopicCancel}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Topic</h3>
            <div className="topic-form-fields">
              <div className="form-group">
                <label>Topic Title *</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="Enter topic title"
                />
              </div>
              <div className="form-group">
                <label>Topic Content *</label>
                <ReactQuill
                  value={newTopic.content}
                  onChange={(value) => setNewTopic({ ...newTopic, content: value })}
                  modules={quillModules}
                  placeholder="Enter topic content"
                />
              </div>
              <div className="form-group">
                <label>Video Link (Optional)</label>
                <input
                  type="url"
                  value={newTopic.videoLink}
                  onChange={(e) => setNewTopic({ ...newTopic, videoLink: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* SECTION 3: MULTIPLE PDF NOTES */}
              <div className="form-group pdfs-manager-group">
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Topic PDFs / Study Materials</label>
                
                {/* List of current PDFs */}
                <div className="pdfs-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  {(newTopic.pdfs || []).map((pdf, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="topic-input"
                          style={{ margin: 0, padding: '5px 8px', fontSize: '0.95rem' }}
                          value={pdf.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewTopic(prev => {
                              const list = [...prev.pdfs];
                              list[idx].name = val;
                              return { ...prev, pdfs: list };
                            });
                          }}
                          placeholder="PDF Name (e.g., Clinical Guidelines)"
                        />
                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>
                          Source: {pdf.url.startsWith('data:') ? 'Uploaded PDF File' : pdf.url}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-opt-btn"
                        style={{ padding: '4px 8px' }}
                        onClick={() => {
                          setNewTopic(prev => ({
                            ...prev,
                            pdfs: prev.pdfs.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(newTopic.pdfs || []).length === 0 && (
                    <p style={{ fontStyle: 'italic', color: '#64748b', margin: 0 }}>No PDF files added yet.</p>
                  )}
                </div>

                {/* Add new PDF form block */}
                <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', border: '1px dotted #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#334155' }}>Add New PDF</h4>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>PDF Display Name</label>
                    <input
                      type="text"
                      className="topic-input"
                      placeholder="Enter PDF display name (e.g., Revision Guide)"
                      id="new-pdf-name"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>Select PDF File from Device</label>
                    <input
                      type="file"
                      accept=".pdf"
                      id="new-pdf-file-upload"
                      className="topic-input"
                      style={{ margin: 0 }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.type !== 'application/pdf') {
                          showNotification('Please select a valid PDF file (.pdf)', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target.result;
                          const nameInput = document.getElementById("new-pdf-name");
                          if (nameInput && !nameInput.value.trim()) {
                            nameInput.value = file.name.replace(/\.pdf$/i, '');
                          }
                          const dataInput = document.getElementById("new-pdf-file-data");
                          if (dataInput) {
                            dataInput.value = dataUrl;
                          }
                          showNotification('Local PDF loaded successfully!', 'success');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <input type="hidden" id="new-pdf-file-data" />
                  </div>
                  <button
                    type="button"
                    className="add-opt-btn"
                    style={{ marginTop: '10px', width: '100%', padding: '8px' }}
                    onClick={() => {
                      const nameInput = document.getElementById("new-pdf-name");
                      const dataInput = document.getElementById("new-pdf-file-data");
                      const fileInput = document.getElementById("new-pdf-file-upload");
                      const name = nameInput ? nameInput.value.trim() : '';
                      const url = dataInput ? dataInput.value.trim() : '';
                      
                      if (!name) {
                        showNotification('Please enter a PDF display name', 'error');
                        return;
                      }
                      if (!url) {
                        showNotification('Please select a PDF file to upload', 'error');
                        return;
                      }
                      
                      setNewTopic(prev => ({
                        ...prev,
                        pdfs: [...(prev.pdfs || []), { name, url }]
                      }));
                      
                      if (nameInput) nameInput.value = '';
                      if (dataInput) dataInput.value = '';
                      if (fileInput) fileInput.value = '';
                      showNotification('PDF added to list!', 'success');
                    }}
                  >
                    + Add to PDF List
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddTopicCancel} className="cancel-btn">Cancel</button>
              <button onClick={handleAddTopicConfirm} className="confirm-btn" disabled={saving}>Add Topic</button>
            </div>
          </div>
        </div>
      )}

      {showEditTopicModal && (
        <div className="modal-overlay" onClick={handleEditTopicCancel}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Topic</h3>
            <div className="topic-form-fields">
              <div className="form-group">
                <label>Topic Title *</label>
                <input
                  type="text"
                  value={editTopic.title}
                  onChange={(e) => setEditTopic({ ...editTopic, title: e.target.value })}
                  placeholder="Enter topic title"
                />
              </div>
              <div className="form-group">
                <label>Topic Content *</label>
                <ReactQuill
                  value={editTopic.content}
                  onChange={(value) => setEditTopic({ ...editTopic, content: value })}
                  modules={quillModules}
                  placeholder="Enter topic content"
                />
              </div>
              <div className="form-group">
                <label>Video Link (Optional)</label>
                <input
                  type="url"
                  value={editTopic.videoLink}
                  onChange={(e) => setEditTopic({ ...editTopic, videoLink: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* SECTION 3: MULTIPLE PDF NOTES */}
              <div className="form-group pdfs-manager-group">
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Topic PDFs / Study Materials</label>
                
                {/* List of current PDFs */}
                <div className="pdfs-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  {(editTopic.pdfs || []).map((pdf, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="topic-input"
                          style={{ margin: 0, padding: '5px 8px', fontSize: '0.95rem' }}
                          value={pdf.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditTopic(prev => {
                              const list = [...prev.pdfs];
                              list[idx].name = val;
                              return { ...prev, pdfs: list };
                            });
                          }}
                          placeholder="PDF Name (e.g., Clinical Guidelines)"
                        />
                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-all' }}>
                          Source: {pdf.url.startsWith('data:') ? 'Uploaded PDF File' : pdf.url}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-opt-btn"
                        style={{ padding: '4px 8px' }}
                        onClick={() => {
                          setEditTopic(prev => ({
                            ...prev,
                            pdfs: prev.pdfs.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(editTopic.pdfs || []).length === 0 && (
                    <p style={{ fontStyle: 'italic', color: '#64748b', margin: 0 }}>No PDF files added yet.</p>
                  )}
                </div>

                {/* Add new PDF form block */}
                <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', border: '1px dotted #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#334155' }}>Add New PDF</h4>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>PDF Display Name</label>
                    <input
                      type="text"
                      className="topic-input"
                      placeholder="Enter PDF display name (e.g., Revision Guide)"
                      id="edit-pdf-name"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>Select PDF File from Device</label>
                    <input
                      type="file"
                      accept=".pdf"
                      id="edit-pdf-file-upload"
                      className="topic-input"
                      style={{ margin: 0 }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.type !== 'application/pdf') {
                          showNotification('Please select a valid PDF file (.pdf)', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target.result;
                          const nameInput = document.getElementById("edit-pdf-name");
                          if (nameInput && !nameInput.value.trim()) {
                            nameInput.value = file.name.replace(/\.pdf$/i, '');
                          }
                          const dataInput = document.getElementById("edit-pdf-file-data");
                          if (dataInput) {
                            dataInput.value = dataUrl;
                          }
                          showNotification('Local PDF loaded successfully!', 'success');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <input type="hidden" id="edit-pdf-file-data" />
                  </div>
                  <button
                    type="button"
                    className="add-opt-btn"
                    style={{ marginTop: '10px', width: '100%', padding: '8px' }}
                    onClick={() => {
                      const nameInput = document.getElementById("edit-pdf-name");
                      const dataInput = document.getElementById("edit-pdf-file-data");
                      const fileInput = document.getElementById("edit-pdf-file-upload");
                      const name = nameInput ? nameInput.value.trim() : '';
                      const url = dataInput ? dataInput.value.trim() : '';
                      
                      if (!name) {
                        showNotification('Please enter a PDF display name', 'error');
                        return;
                      }
                      if (!url) {
                        showNotification('Please select a PDF file to upload', 'error');
                        return;
                      }
                      
                      setEditTopic(prev => ({
                        ...prev,
                        pdfs: [...(prev.pdfs || []), { name, url }]
                      }));
                      
                      if (nameInput) nameInput.value = '';
                      if (dataInput) dataInput.value = '';
                      if (fileInput) fileInput.value = '';
                      showNotification('PDF added to list!', 'success');
                    }}
                  >
                    + Add to PDF List
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleEditTopicCancel} className="cancel-btn">Cancel</button>
              <button onClick={handleEditTopicConfirm} className="confirm-btn" disabled={saving}>Update Topic</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteTopicModal && (
        <div className="modal-overlay" onClick={handleDeleteTopicCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Topic</h3>
            <p>Are you sure you want to delete this topic?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteTopicCancel} className="cancel-btn">Cancel</button>
              <button onClick={handleDeleteTopicConfirm} className="delete-confirm-btn" disabled={saving}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE SECTION MCQs MODAL */}
      {showMcqModal && mcqTopicIndex !== null && formData.topics[mcqTopicIndex] && (
        <div className="modal-overlay" onClick={closeMcqModal}>
          <div className="modal-dialog mcq-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '950px', width: '90%' }}>
            <div className="modal-header">
              <h2>Manage MCQ Sections - {formData.topics[mcqTopicIndex].title}</h2>
              <button className="modal-close" onClick={closeMcqModal}>×</button>
            </div>

            <div className="modal-body mcq-modal-body">
              {activeMcqSectionIndex === null ? (
                /* VIEW A: SECTIONS LIST */
                <div className="admin-sections-list-view" style={{ width: '100%' }}>
                  <div className="admin-add-section-form" style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label>New MCQ Section Title</label>
                      <input
                        type="text"
                        className="topic-input"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="e.g. Clinical Presentation, Pharmacological Management..."
                      />
                    </div>
                    <button type="button" onClick={handleAddSection} className="save-mcq-item-btn" style={{ height: '42px', padding: '0 20px' }}>
                      + Add Section
                    </button>
                  </div>

                  <h3>Current Topic MCQ Sections ({mcqSectionsList.length})</h3>
                  {mcqSectionsList.length === 0 ? (
                    <p className="no-mcqs-text">No MCQ sections added yet. Create a section above to start adding questions.</p>
                  ) : (
                    <div className="admin-mcqs-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {mcqSectionsList.map((section, idx) => (
                        <div key={idx} className="admin-mcq-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                          <div style={{ flex: 1 }}>
                            {editingSectionIndex === idx ? (
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="topic-input"
                                  value={editingSectionTitle}
                                  onChange={(e) => setEditingSectionTitle(e.target.value)}
                                  style={{ margin: 0, height: '36px' }}
                                />
                                <button type="button" onClick={() => handleSaveRenameSection(idx)} className="save-mcq-item-btn" style={{ padding: '5px 10px', height: '36px' }}>Save</button>
                                <button type="button" onClick={() => setEditingSectionIndex(null)} className="cancel-mcq-item-btn" style={{ padding: '5px 10px', height: '36px' }}>Cancel</button>
                              </div>
                            ) : (
                              <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{section.title}</h4>
                                <span className="mcq-count-tag" style={{ background: '#e9ecef', color: '#495057', fontSize: '0.85rem' }}>
                                  {section.mcqs?.length || 0} Question{(section.mcqs?.length || 0) === 1 ? '' : 's'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {editingSectionIndex !== idx && (
                            <div className="q-item-actions" style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="edit-mcq-btn"
                                onClick={() => setActiveMcqSectionIndex(idx)}
                                style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Manage Questions ({section.mcqs?.length || 0})
                              </button>
                              <button
                                type="button"
                                className="edit-mcq-btn"
                                onClick={() => handleStartRenameSection(idx)}
                                style={{ background: '#6c757d', color: '#fff' }}
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                className="del-mcq-btn"
                                onClick={() => handleDeleteSection(idx)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW B: QUESTIONS WITHIN ACTIVE SECTION */
                <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                  <div className="admin-mcq-list-section" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <button type="button" onClick={() => setActiveMcqSectionIndex(null)} className="cancel-btn" style={{ padding: '5px 10px', fontSize: '0.9rem' }}>
                        ← Back to Sections
                      </button>
                      <h3 style={{ margin: 0 }}>Section: {mcqSectionsList[activeMcqSectionIndex].title}</h3>
                    </div>
                    
                    <h3>Questions ({mcqSectionsList[activeMcqSectionIndex].mcqs?.length || 0})</h3>
                    {(!mcqSectionsList[activeMcqSectionIndex].mcqs || mcqSectionsList[activeMcqSectionIndex].mcqs.length === 0) ? (
                      <p className="no-mcqs-text">No questions in this section yet. Add one on the right.</p>
                    ) : (
                      <div className="admin-mcqs-grid">
                        {mcqSectionsList[activeMcqSectionIndex].mcqs.map((mcq, idx) => (
                          <div key={idx} className={`admin-mcq-item ${editingMcqIndex === idx ? 'editing' : ''}`}>
                            <div className="admin-mcq-item-header">
                              <span className="q-badge">Q{idx + 1}</span>
                              <div className="q-item-actions">
                                <button type="button" className="edit-mcq-btn" onClick={() => handleEditMcqItem(idx)}>Edit</button>
                                <button type="button" className="del-mcq-btn" onClick={() => handleDeleteMcqItem(idx)}>Delete</button>
                              </div>
                            </div>
                            <p className="q-stem-text">{mcq.question}</p>
                            <ul className="q-options-preview">
                              {mcq.options.map((opt, oIdx) => (
                                <li key={oIdx} className={oIdx === mcq.correctOption ? 'correct-opt' : ''}>
                                  <strong>{['A','B','C','D','E','F'][oIdx]}:</strong> {opt}
                                  {oIdx === mcq.correctOption && ' ✓'}
                                </li>
                              ))}
                            </ul>
                            {mcq.explanation && (
                              <div className="q-exp-preview">
                                <strong>Explanation:</strong> {mcq.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-mcq-editor-section" style={{ width: '400px', flexShrink: 0 }}>
                    <h3>{editingMcqIndex !== null ? `Edit Question ${editingMcqIndex + 1}` : 'Add New Question'}</h3>
                    <div className="form-group">
                      <label>Question Stem *</label>
                      <textarea
                        rows={3}
                        className="topic-input"
                        value={mcqForm.question}
                        onChange={(e) => setMcqForm(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter clinical presentation..."
                      />
                    </div>
                    <div className="form-group">
                      <div className="options-header">
                        <label>Options *</label>
                        <button type="button" className="add-opt-btn" onClick={handleAddOptionField} disabled={mcqForm.options.length >= 6}>+ Add Option</button>
                      </div>
                      <div className="mcq-options-inputs">
                        {mcqForm.options.map((optText, optIdx) => (
                          <div key={optIdx} className="option-input-row">
                            <input
                              type="radio"
                              name="correctOptionRadio"
                              checked={mcqForm.correctOption === optIdx}
                              onChange={() => setMcqForm(prev => ({ ...prev, correctOption: optIdx }))}
                            />
                            <span className="opt-prefix">{['A','B','C','D','E','F'][optIdx]}</span>
                            <input
                              type="text"
                              className="topic-input"
                              value={optText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMcqForm(prev => {
                                  const opts = [...prev.options];
                                  opts[optIdx] = val;
                                  return { ...prev, options: opts };
                                });
                              }}
                              placeholder={`Option ${['A','B','C','D','E','F'][optIdx]}`}
                            />
                            {mcqForm.options.length > 2 && (
                              <button type="button" className="remove-opt-btn" onClick={() => handleRemoveOptionField(optIdx)}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Explanation</label>
                      <textarea
                        rows={2}
                        className="topic-input"
                        value={mcqForm.explanation}
                        onChange={(e) => setMcqForm(prev => ({ ...prev, explanation: e.target.value }))}
                        placeholder="Provide detailed clinical explanation..."
                      />
                    </div>
                    <div className="mcq-item-actions">
                      <button type="button" onClick={handleSaveMcqItem} className="save-mcq-item-btn">
                        {editingMcqIndex !== null ? 'Update Question' : 'Add to Section'}
                      </button>
                      {editingMcqIndex !== null && (
                        <button
                          type="button"
                          className="cancel-mcq-item-btn"
                          onClick={() => {
                            setEditingMcqIndex(null);
                            setMcqForm({ question: '', options: ['', '', '', ''], correctOption: 0, explanation: '' });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeMcqModal} className="cancel-btn">
                Close
              </button>
              <button onClick={handleSaveAllMcqs} className="confirm-btn" disabled={saving}>
                {saving ? 'Saving...' : `Save All Sections MCQs (${mcqSectionsList.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNEXTSubjectContent;
