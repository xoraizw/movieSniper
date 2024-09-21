import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Github, Linkedin, Code, BookOpen, Globe, Home } from 'lucide-react'; // Import the Home icon
import FilmLogo from './film.png';
import ProfilePic from './pic-2.jpg';

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const AboutMePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-3 flex justify-between items-center bg-gray-900 text-white">
        <div className="flex items-center space-x-0">
          <img src={FilmLogo} alt="movieSniper logo" className="w-12 h-12" />
          <div className="text-2xl font-bold text-yellow-500">
            <a href="/" className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"> movieSniper </a>
          </div>
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
            <li>
              <a
                href="/"
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <Home />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                }}
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <User /> 
                <span>About</span>
              </a>
            </li>
            <li>
              <a
                href="#skills"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('skills');
                }}
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <Code /> 
                <span>Skills</span>
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <Mail /> 
                <span>Contact</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <nav
          ref={menuRef}
          className={`md:hidden absolute top-full left-0 w-full bg-gray-900 bg-opacity-80 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          <ul className="flex flex-col items-center space-y-4 p-4">
            <li>
              <a
                href="/"
                className="flex items-center hover:text-yellow-500 space-x-2"
                onClick={() => setIsMenuOpen(false)} // Close menu on link click
              >
                <Home />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                  setIsMenuOpen(false); // Close menu after click
                }}
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <User />
                <span>About</span>
              </a>
            </li>
            <li>
              <a
                href="#skills"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('skills');
                  setIsMenuOpen(false); // Close menu after click
                }}
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <Code />
                <span>Skills</span>
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                  setIsMenuOpen(false); // Close menu after click
                }}
                className="flex items-center hover:text-yellow-500 space-x-2"
              >
                <Mail />
                <span>Contact</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-6">
              <img 
                src={ProfilePic} 
                className="rounded-xl border-4 border-yellow-500 object-cover min-w-[10rem] min-h-[10rem] w-40 h-40" 
                alt="Profile"
              />
            </div>
            <div className="flex flex-col justify-center text-center md:text-left">
              <h1 className="text-5xl font-bold mb-2">Ahmad Xoraiz Waheed</h1>
              <p className="text-xl mb-8">CS @ LUMS'25 | Full stack developer | Machine Learning enthusiast</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
            <User className="mr-2" /> About Me
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-6">
              Hello! I'm Xoraiz, the creator of MovieSniper. As a passionate film enthusiast and AI developer, 
              I've combined my love for cinema with cutting-edge technology to bring you personalized movie 
              recommendations like never before.
            </p>
            <p className="text-lg mb-6">
              With the power of LLMs and an extensive dataset of movies, I've developed MovieSniper 
              to help fellow movie lovers discover hidden gems and reconnect with their favorite genres.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
            <Code className="mr-2" /> Skills & Expertise
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <SkillCard
              icon={<Globe size={40} />}
              title="Web Development"
              description="Expertise in Full stack web-development using popular frameworks."
            />
            <SkillCard
              icon={<Code size={40} />}
              title="Machine Learning Development"
              description="Expertise in machine learning, natural language processing, and deep learning."
            />
            <SkillCard
              icon={<BookOpen size={40} />}
              title="Technical Writing"
              description="Technical blog writing and instructional content creation for AI/ML topics."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
            <Mail className="mr-2" /> Contact Me
          </h2>
          <div className="flex justify-center space-x-8">
            <a
              href="mailto:25100055@lums.edu.pk"
              target="_blank"
              className="flex items-center hover:text-yellow-500 space-x-2"
            >
              <Mail />
              <span>Email</span>
            </a>
            <a
              href="https://github.com/xoraizw"
              target="_blank"
              className="flex items-center hover:text-yellow-500 space-x-2"
            >
              <Github />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/xoraiz/"
              target="_blank"
              className="flex items-center hover:text-yellow-500 space-x-2"
            >
              <Linkedin />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

const SkillCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default AboutMePage;
