import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import PLABMain from './pages/PLABMain';
import PLABInfo from './pages/PLABInfo';
import PLAB1Tips from './pages/PLAB1Tips';
import PLAB1Theory from './pages/PLAB1Theory';
import TheorySubjectDetail from './pages/TheorySubjectDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlabContent from './pages/AdminPlabContent';
import AdminPlab1Tips from './pages/AdminPlab1Tips';
import AdminTheorySubjects from './pages/AdminTheorySubjects';
import AdminTheoryContent from './pages/AdminTheoryContent';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/exams/plab" element={<PLABMain />} />
          <Route path="/plab/what-is-plab" element={<PLABInfo />} />
          <Route path="/plab/plab1-tips" element={<PLAB1Tips />} />
          <Route path="/plab/plab1/theory" element={<PLAB1Theory />} />
          <Route path="/theory/:subjectId" element={<TheorySubjectDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/plab-content" element={<AdminPlabContent />} />
          <Route path="/admin/plab1-tips" element={<AdminPlab1Tips />} />
          <Route path="/admin/theory-subjects" element={<AdminTheorySubjects />} />
          <Route path="/admin/theory-content" element={<AdminTheoryContent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
