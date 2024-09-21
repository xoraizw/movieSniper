import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, User } from 'lucide-react';
import Film from './film.png';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="relative z-10 container mx-auto px-4 py-3 flex justify-between items-center bg-gray-900 text-white">
      <div className="flex items-center space-x-0">
        <img src={Film} alt="movieSniper logo" className="w-12 h-12" />
        <div className="text-2xl font-bold text-yellow-500">movieSniper</div>
      </div>
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

      <nav className="hidden md:flex md:items-center md:space-x-8">
        <ul className="flex items-center space-x-8">
          <li className="flex items-center space-x-2">
            <Link
              to="#features" // Change this to the appropriate route if needed
              className={`flex items-center space-x-2 transition-colors duration-300 ${
                activeLink === 'features' ? 'text-yellow-500' : 'hover:text-yellow-500'
              }`}
              onClick={() => setActiveLink('features')}
            >
              <Sparkles className="w-5 h-5" />
              <span>Features</span>
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <Link
              to="#how-it-works" // Change this to the appropriate route if needed
              className={`flex items-center space-x-2 transition-colors duration-300 ${
                activeLink === 'how-it-works' ? 'text-yellow-500' : 'hover:text-yellow-500'
              }`}
              onClick={() => setActiveLink('how-it-works')}
            >
              <Sliders className="w-5 h-5" />
              <span>How It Works</span>
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <Link
              to="/aboutme" // Use Link for routing
              className={`flex items-center space-x-2 transition-colors duration-300 ${
                activeLink === 'aboutme' ? 'text-yellow-500' : 'hover:text-yellow-500'
              }`}
              onClick={() => {
                setActiveLink('aboutme');
                setIsMenuOpen(false); // Close menu on mobile
              }}
            >
              <User className="w-5 h-5" />
              <span>About Me</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <nav ref={menuRef} className={`md:hidden absolute top-full left-0 w-full bg-gray-900 bg-opacity-80 ${isMenuOpen ? 'opacity-100 visible z-50' : 'opacity-0 invisible'} transition-opacity duration-300 ease-in-out`}>
        <ul className="flex flex-row items-center justify-center space-x-6 p-4 whitespace-nowrap">
          <li className="pl-4">
            <Link
              to="#features"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-300"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-base">Features</span>
            </Link>
          </li>
          <li>
            <Link
              to="#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-300"
            >
              <Sliders className="w-5 h-5" />
              <span className="text-base">How It Works</span>
            </Link>
          </li>
          <li className="pr-4">
            <Link
              to="/aboutme"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveLink('aboutme'); // Set active link on click
              }}
              className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-300"
            >
              <User className="w-5 h-5" />
              <span className="text-base">About Me</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
