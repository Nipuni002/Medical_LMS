import React from 'react';
import Header from '../components/Header';
import SubjectsGrid from '../components/SubjectsGrid';
import Footer from '../components/Footer';
import './Subjects.css';

function Subjects() {
  return (
    <div className="subjects-page">
      <Header />
      <div className="subjects-container">
        <div className="subjects-header">
          <h1>Medical Subjects</h1>
          <p>Explore comprehensive learning materials across various medical disciplines</p>
        </div>
        <SubjectsGrid />
      </div>
      <Footer />
    </div>
  );
}

export default Subjects;
