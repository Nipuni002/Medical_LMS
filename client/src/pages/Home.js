import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import QuickLinks from '../components/QuickLinks';
import SubjectsGrid from '../components/SubjectsGrid';
import ContactSection from '../components/ContactSection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <Header />
      <HeroSection />
      <QuickLinks />
      <SubjectsGrid />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default Home;