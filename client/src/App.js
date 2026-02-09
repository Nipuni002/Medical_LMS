import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import PLABMain from './pages/PLABMain';
import PLABInfo from './pages/PLABInfo';
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
