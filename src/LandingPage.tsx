import React, { useState, useEffect } from 'react';
import Header from './Header';
import HeroSection from './HeroSection.tsx';
import HowItWorksSection from './HowItWorksSection.tsx';
import CTASection from './CTASection.tsx';
import Footer from './Footer.tsx';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOffset((prevOffset) => (prevOffset + 1) % 200);
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  const popularMovies = [
    "The Godfather", "Pulp Fiction", "The Shawshank Redemption", "The Dark Knight",
    "Forrest Gump", "Inception", "The Matrix", "Goodfellas", "Fight Club",
    "Star Wars", "Jurassic Park", "The Lord of the Rings", "Titanic", "Avatar",
    "Gladiator", "The Silence of the Lambs", "Saving Private Ryan", "The Avengers",
    "Interstellar", "The Departed", "Django Unchained", "Braveheart", "Schindler's List",
    "Back to the Future", "The Prestige", "The Lion King", "Mad Max: Fury Road",
    "Se7en", "The Usual Suspects", "Casablanca", "Jaws", "12 Angry Men", "The Godfather: Part II",
    "A Clockwork Orange", "Eternal Sunshine of the Spotless Mind"
  ];
  

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <Header />
      <HeroSection 
        handleSearch={handleSearch} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        offset={offset} 
        popularMovies={popularMovies} 
      />
      {/* Add id attributes to the sections */}
      {/* <section id="features">
        <FeaturesSection />
      </section> */}
      <section id="how-it-works">
        <HowItWorksSection />
      </section>
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
