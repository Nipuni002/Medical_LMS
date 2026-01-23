import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ContactSection from '../components/ContactSection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <Header />
      <HeroSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default Home;