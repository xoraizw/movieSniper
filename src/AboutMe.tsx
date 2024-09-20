import React from 'react';
import { User, Mail, Github, Linkedin, Film, Code, BookOpen } from 'lucide-react';
import FilmLogo from './film.png'

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const AboutMePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-0">
          <img src={FilmLogo} alt="movieSniper logo" className="w-12 h-12" />
          <div className="text-2xl font-bold text-yellow-500"> <a href="/" className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"> movieSniper </a> </div>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-yellow-500">Home</a></li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                }}
                className="hover:text-yellow-500"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#skills"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('skills');
                }}
                className="hover:text-yellow-500"
              >
                Skills
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
                className="hover:text-yellow-500"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <img src="/api/placeholder/200/200" alt="Your Name" className="rounded-full mx-auto" />
          </div>
          <h1 className="text-5xl font-bold mb-6">John Doe</h1>
          <p className="text-xl mb-8">Creator of MovieSniper | AI Developer | Film Enthusiast</p>
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
              Hello! I'm John Doe, the creator of MovieSniper. As a passionate film enthusiast and AI developer, 
              I've combined my love for cinema with cutting-edge technology to bring you personalized movie 
              recommendations like never before.
            </p>
            <p className="text-lg mb-6">
              With over 10 years of experience in machine learning and data science, I've developed MovieSniper 
              to help fellow movie lovers discover hidden gems and reconnect with their favorite genres. My goal 
              is to make every movie night an unforgettable experience.
            </p>
            <p className="text-lg mb-6">
              When I'm not working on improving MovieSniper, you can find me attending film festivals, discussing 
              classic movies with friends, or exploring new AI technologies. I'm constantly inspired by the 
              intersection of art and technology, and I strive to bring that passion to every project I work on.
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
              icon={<Film size={40} />}
              title="Film Analysis"
              description="Deep understanding of film theory, genres, and cinematic techniques."
            />
            <SkillCard
              icon={<Code size={40} />}
              title="AI Development"
              description="Expertise in machine learning, natural language processing, and recommendation systems."
            />
            <SkillCard
              icon={<BookOpen size={40} />}
              title="Data Science"
              description="Proficient in data analysis, visualization, and big data processing."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
            <Mail className="mr-2" /> Get in Touch
          </h2>
          <div className="flex justify-center space-x-8">
            <a href="mailto:john@moviesniper.com" className="text-white hover:text-yellow-500 transition duration-300">
              <Mail size={32} />
            </a>
            <a href="https://github.com/johndoe" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500 transition duration-300">
              <Github size={32} />
            </a>
            <a href="https://linkedin.com/in/johndoe" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500 transition duration-300">
              <Linkedin size={32} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 MovieSniper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const SkillCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-gray-700 p-6 rounded-lg text-center">
    <div className="text-yellow-500 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-yellow-500">{title}</h3>
    <p>{description}</p>
  </div>
);

export default AboutMePage;
