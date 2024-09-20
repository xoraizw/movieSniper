import React, { useState } from 'react';
import { Sparkles, Sliders, User } from 'lucide-react';
import Film from './film.png'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative z-10 container mx-auto px-4 py-3 flex justify-between items-center bg-gray-900 text-white">
      {/* <div className="text-2xl font-bold text-yellow-500">movieSniper</div> */}
      <div className="flex items-center space-x-0">
        <img src={Film} alt="movieSniper logo" className="w-12 h-12" />
        <div className="text-2xl font-bold text-yellow-500">movieSniper</div>
      </div>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center text-yellow-500 hover:text-yellow-600"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="sr-only">Open main menu</span>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex md:items-center md:space-x-8">
        <ul className="flex items-center space-x-8">
          <li className="flex items-center space-x-2">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
              className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
            >
              <Sparkles className="w-5 h-5" />
              <span>Features</span>
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('how-it-works');
              }}
              className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
            >
              <Sliders className="w-5 h-5" />
              <span>How It Works</span>
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <a
              href="/aboutme"
              className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
            >
              <User className="w-5 h-5" />
              <span>About Me</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <nav
        className={`md:hidden absolute top-full left-0 w-full bg-gray-900 bg-opacity-80 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        } transition-opacity duration-300 ease-in-out`}
      >
        <ul className="flex flex-col items-center space-y-4 p-4">
          <li className="flex items-center space-x-2">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
              className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
            >
              <Sparkles className="w-5 h-5" />
              <span>Features</span>
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('how-it-works');
              }}
              className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
            >
              <Sliders className="w-5 h-5" />
              <span>How It Works</span>
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <a
              href="/aboutme"
              className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
            >
              <User className="w-5 h-5" />
              <span>About Me</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
