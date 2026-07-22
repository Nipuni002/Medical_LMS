import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import UserSideNav from './components/UserSideNav';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import PLABMain from './pages/PLABMain';
import USMLEMain from './pages/USMLEMain';
import AMCMain from './pages/AMCMain';
import NextMain from './pages/NextMain';
import USMLEStep1Subjects from './pages/USMLEStep1Subjects';
import USMLEStep1Introduction from './pages/USMLEStep1Introduction';
import USMLEStep1Pretest from './pages/USMLEStep1Pretest';
import USMLEStep1Exam from './pages/USMLEStep1Exam';
import USMLEStep1PretestReview from './pages/USMLEStep1PretestReview';
import USMLEStep2Pretest from './pages/USMLEStep2Pretest';
import USMLEStep2Exam from './pages/USMLEStep2Exam';
import USMLEStep2PretestReview from './pages/USMLEStep2PretestReview';
import USMLEStep3Pretest from './pages/USMLEStep3Pretest';
import USMLEStep3Exam from './pages/USMLEStep3Exam';
import USMLEStep3BlockExam from './pages/USMLEStep3BlockExam';
import USMLETheorySubjectDetail from './pages/USMLETheorySubjectDetail';
import AMCStepSubjects from './pages/AMCStepSubjects';
import AMCTheorySubjectDetail from './pages/AMCTheorySubjectDetail';
import AMCStep1Pretest from './pages/AMCStep1Pretest';
import AMCStep1Exam from './pages/AMCStep1Exam';
import AMCStep2Pretest from './pages/AMCStep2Pretest';
import AMCStep2Exam from './pages/AMCStep2Exam';
import NEXTStepSubjects from './pages/NEXTStepSubjects';
import NEXTTheorySubjectDetail from './pages/NEXTTheorySubjectDetail';
import PLABInfo from './pages/PLABInfo';
import PLAB2Guide from './pages/PLAB2Guide';
import PLAB2Pretest from './pages/PLAB2Pretest';
import PLAB1Tips from './pages/PLAB1Tips';
import PLAB1Theory from './pages/PLAB1Theory';
import PLAB2Theory from './pages/PLAB2Theory';
import TheorySubjectDetail from './pages/TheorySubjectDetail';
import ReviseQuestionsPage from './pages/ReviseQuestionsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlabContent from './pages/AdminPlabContent';
import AdminPlab1Tips from './pages/AdminPlab1Tips';
import AdminPlab2Guide from './pages/AdminPlab2Guide';
import AdminPlab2Pretest from './pages/AdminPlab2Pretest';
import AdminPlab1Tests from './pages/AdminPlab1Tests';
import AdminTheorySubjects from './pages/AdminTheorySubjects';
import AdminTheorySubjectContent from './pages/AdminTheorySubjectContent';
import AdminUSMLEIntroductionContent from './pages/AdminUSMLEIntroductionContent';
import AdminUSMLESubjectContent from './pages/AdminUSMLESubjectContent';
import AdminUSMLEStep1Pretest from './pages/AdminUSMLEStep1Pretest';
import AdminUSMLEStep2Pretest from './pages/AdminUSMLEStep2Pretest';
import AdminUSMLEStep3Pretest from './pages/AdminUSMLEStep3Pretest';
import AdminAMCStep1Pretest from './pages/AdminAMCStep1Pretest';
import AdminAMCStep2Pretest from './pages/AdminAMCStep2Pretest';
import AdminAMCSubjects from './pages/AdminAMCSubjects';
import AdminAMCContent from './pages/AdminAMCContent';
import AdminAMCSubjectContent from './pages/AdminAMCSubjectContent';
import AdminNEXTSubjects from './pages/AdminNEXTSubjects';
import AdminNEXTContent from './pages/AdminNEXTContent';
import AdminNEXTSubjectContent from './pages/AdminNEXTSubjectContent';
import AdminUnifiedSubjectsContent from './pages/AdminUnifiedSubjectsContent';
import AdminAboutContent from './pages/AdminAboutContent';
import AdminContactContent from './pages/AdminContactContent';
import PLAB1Test from './pages/PLAB1Test';
import PLAB1TestReview from './pages/PLAB1TestReview';
import LegalPage from './pages/LegalPage';
import AdminLegalContent from './pages/AdminLegalContent';
import './App.css';


function AppContent() {
  const location = useLocation();
  const [isUserNavOpen, setIsUserNavOpen] = useState(false);
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showUserSideNav = !isHomePage && !isAdminRoute;

  return (
    <div className={`App ${showUserSideNav && isUserNavOpen ? 'with-user-nav' : ''}`}>
      {showUserSideNav && <UserSideNav onOpenChange={setIsUserNavOpen} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/exams/usmle" element={<USMLEMain />} />
        <Route
          path="/exams/usmle/step1-subjects"
          element={<USMLEStep1Subjects fallbackSubjects={[]} />}
        />
        <Route path="/exams/usmle/step1-introduction" element={<USMLEStep1Introduction />} />
        <Route path="/exams/usmle/step1-pretest" element={<USMLEStep1Pretest />} />
        <Route path="/exams/usmle/step1-pretest/exam" element={<USMLEStep1Exam />} />
        <Route path="/exams/usmle/step1-pretest/review" element={<USMLEStep1PretestReview />} />
        <Route path="/exams/usmle/step2-pretest" element={<USMLEStep2Pretest />} />
        <Route path="/exams/usmle/step2-pretest/exam" element={<USMLEStep2Exam />} />
        <Route path="/exams/usmle/step2-pretest/review" element={<USMLEStep2PretestReview />} />
        <Route path="/exams/usmle/step3-pretest" element={<USMLEStep3Pretest />} />
        <Route path="/exams/usmle/step3-pretest/exam" element={<USMLEStep3Exam />} />
        <Route path="/exams/usmle/step3-pretest/block/:dayKey/:blockNumber" element={<USMLEStep3BlockExam />} />
        <Route
          path="/exams/usmle/step2-subjects"
          element={
            <USMLEStep1Subjects
              step="STEP_2"
              heading="USMLE STEP 2 CK Subjects"
              description="Choose a subject tab to focus your STEP 2 CK preparation."
              fallbackSubjects={[]}
            />
          }
        />
        <Route
          path="/exams/usmle/step3-subjects"
          element={
            <USMLEStep1Subjects
              step="STEP_3"
              heading="USMLE STEP 3 Subjects"
              description="Choose a subject tab to focus your STEP 3 preparation."
              fallbackSubjects={[]}
            />
          }
        />
        <Route path="/exams/usmle/theory/:subjectId" element={<USMLETheorySubjectDetail />} />
        <Route path="/exams/amc" element={<AMCMain />} />
        <Route path="/exams/amc/step1-pretest" element={<AMCStep1Pretest />} />
        <Route path="/exams/amc/step1-pretest/exam" element={<AMCStep1Exam />} />
        <Route path="/exams/amc/step2-pretest" element={<AMCStep2Pretest />} />
        <Route path="/exams/amc/step2-pretest/exam" element={<AMCStep2Exam />} />
        <Route
          path="/exams/amc/step1-subjects"
          element={
            <AMCStepSubjects
              step="STEP_1"
              heading="AMC Step 1 Subjects"
              description="Choose a Step 1 subject to open theory content."
            />
          }
        />
        <Route
          path="/exams/amc/step2-subjects"
          element={
            <AMCStepSubjects
              step="STEP_2"
              heading="AMC Step 2 Subjects"
              description="Choose a Step 2 subject to open theory content."
            />
          }
        />
        <Route path="/exams/amc/theory/:subjectId" element={<AMCTheorySubjectDetail />} />
        <Route path="/exams/neet-ug" element={<Navigate to="/" replace />} />
        <Route path="/exams/next" element={<Navigate to="/" replace />} />
        <Route path="/exams/next/step1-subjects" element={<Navigate to="/" replace />} />
        <Route path="/exams/next/step2-subjects" element={<Navigate to="/" replace />} />
        <Route path="/exams/next/theory/:subjectId" element={<Navigate to="/" replace />} />
        <Route path="/exams/plab" element={<PLABMain />} />
        <Route path="/plab/what-is-plab" element={<PLABInfo />} />
        <Route path="/plab/plab2/guide" element={<PLAB2Guide />} />
        <Route path="/plab/plab2/practice" element={<PLAB2Pretest />} />
        <Route path="/plab/plab1-tips" element={<PLAB1Tips />} />
        <Route path="/plab/plab1/tests" element={<PLAB1Test />} />
        <Route path="/plab/plab1/tests/review" element={<PLAB1TestReview />} />
        <Route path="/plab/plab1/theory" element={<PLAB1Theory />} />
        <Route path="/plab/plab2/theory" element={<PLAB2Theory />} />
        <Route path="/plab/plab1/theory/:subjectId" element={<TheorySubjectDetail />} />
        <Route path="/plab/plab2/theory/:subjectId" element={<TheorySubjectDetail />} />
        <Route path="/theory/:subjectId" element={<TheorySubjectDetail />} />
        <Route path="/questions/:subjectId" element={<ReviseQuestionsPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/plab-content" element={<AdminPlabContent />} />
        <Route path="/admin/plab1-tips" element={<AdminPlab1Tips />} />
        <Route path="/admin/plab2-guide" element={<AdminPlab2Guide />} />
        <Route path="/admin/plab2-pretest" element={<AdminPlab2Pretest />} />
        <Route path="/admin/plab1-tests" element={<AdminPlab1Tests />} />
        <Route path="/admin/theory-subjects" element={<AdminTheorySubjects />} />
        <Route path="/admin/theory-content" element={<Navigate to="/admin/subjects-content?category=plab" replace />} />
        <Route path="/admin/theory-content/:subjectId" element={<AdminTheorySubjectContent />} />
        <Route path="/admin/usmle-content/introduction" element={<AdminUSMLEIntroductionContent />} />
        <Route path="/admin/usmle-content/:subjectId" element={<AdminUSMLESubjectContent />} />
        <Route path="/admin/usmle-step1-pretest" element={<AdminUSMLEStep1Pretest />} />
        <Route path="/admin/usmle-step2-pretest" element={<AdminUSMLEStep2Pretest />} />
        <Route path="/admin/usmle-step3-pretest" element={<AdminUSMLEStep3Pretest />} />
        <Route path="/admin/amc-step1-pretest" element={<AdminAMCStep1Pretest />} />
        <Route path="/admin/amc-step2-pretest" element={<AdminAMCStep2Pretest />} />
        <Route path="/admin/amc-subjects" element={<AdminAMCSubjects />} />
        <Route path="/admin/amc-content" element={<AdminAMCContent />} />
        <Route path="/admin/amc-content/step/:step" element={<AdminAMCContent />} />
        <Route path="/admin/amc-content/:subjectId" element={<AdminAMCSubjectContent />} />
        <Route path="/admin/next-subjects" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/next-content" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/next-content/step/:step" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/next-content/:subjectId" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/subjects-content" element={<AdminUnifiedSubjectsContent />} />
        <Route path="/admin/about-content" element={<AdminAboutContent />} />
        <Route path="/admin/contact-content" element={<AdminContactContent />} />
        <Route path="/admin/legal-content" element={<AdminLegalContent />} />
        <Route path="/privacy-policy" element={<LegalPage type="privacy-policy" />} />
        <Route path="/terms-of-service" element={<LegalPage type="terms-of-service" />} />
        <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
