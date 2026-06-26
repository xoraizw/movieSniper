import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Github, Linkedin, Code, BookOpen, Globe, Menu, X, ExternalLink, Film } from 'lucide-react';
import ProfilePic from './pic-2.jpg';
import Reveal from './Reveal.tsx';

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const AboutMePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-film-bg text-film-text">
      {/* Header */}
      <header
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? 'rgba(10,9,8,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,248,235,0.06)' : '1px solid transparent',
        }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <Film className="w-4 h-4 text-film-gold opacity-80" strokeWidth={1.5} />
            <span className="font-body text-xs font-light tracking-[0.22em] text-film-muted uppercase leading-none">
              movie
            </span>
            <span
              className="font-display italic font-bold text-film-gold leading-none"
              style={{ fontSize: '1.125rem', letterSpacing: '-0.01em', marginLeft: '-2px' }}
            >
              Sniper
            </span>
          </a>

          <button
            className="md:hidden p-2 text-film-muted hover:text-film-cream transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200">
              Home
            </a>
            <button
              onClick={() => scrollToSection('about')}
              className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('skills')}
              className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200"
            >
              Contact
            </button>
          </nav>

          <div
            ref={menuRef}
            className="md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-300"
            style={{
              maxHeight: isMenuOpen ? '200px' : '0',
              opacity: isMenuOpen ? 1 : 0,
              backgroundColor: '#0A0908',
              borderBottom: isMenuOpen ? '1px solid rgba(255,248,235,0.06)' : 'none',
            }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {[
                { label: 'Home', action: () => { window.location.href = '/'; } },
                { label: 'About', action: () => { scrollToSection('about'); setIsMenuOpen(false); } },
                { label: 'Skills', action: () => { scrollToSection('skills'); setIsMenuOpen(false); } },
                { label: 'Contact', action: () => { scrollToSection('contact'); setIsMenuOpen(false); } },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(196,150,58,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0908)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative flex-shrink-0">
                <img
                  src={ProfilePic}
                  className="w-36 h-36 md:w-40 md:h-40 object-cover"
                  style={{
                    borderRadius: '2px',
                    border: '1px solid rgba(196,150,58,0.3)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                  }}
                  alt="Ahmad Xoraiz Waheed"
                />
                <div
                  className="absolute -inset-2 -z-10 blur-2xl"
                  style={{ backgroundColor: 'rgba(196,150,58,0.07)' }}
                />
              </div>
              <div className="flex flex-col text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                  <div className="h-px w-8 bg-film-gold opacity-60" />
                  <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold">
                    Creator & Developer
                  </span>
                </div>
                <h1
                  className="font-display font-bold text-film-cream leading-tight mb-2"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  Ahmad Xoraiz Waheed
                </h1>
                <p className="font-body text-film-muted text-base">
                  CS @ LUMS'25 &nbsp;·&nbsp; Full Stack Developer &nbsp;·&nbsp; ML Enthusiast
                </p>
                <div className="flex gap-2.5 mt-6 justify-center md:justify-start">
                  <SocialButton href="https://github.com/xoraizw" icon={<Github className="w-4 h-4" />} label="GitHub" />
                  <SocialButton href="https://www.linkedin.com/in/xoraiz/" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
                  <SocialButton href="mailto:25100055@lums.edu.pk" icon={<Mail className="w-4 h-4" />} label="Email" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <SectionHeading icon={<User className="w-4 h-4" />} title="About Me" />
          </Reveal>
          <div className="max-w-2xl">
            <Reveal delay={80}>
              <p className="font-body text-film-text text-base leading-relaxed mb-5">
                Hello! I'm Xoraiz, the creator of MovieSniper. As a passionate film enthusiast and AI developer,
                I've combined my love for cinema with cutting-edge technology to bring you personalized movie
                recommendations like never before.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="font-body text-film-text text-base leading-relaxed">
                With the power of LLMs and an extensive dataset of movies, I built MovieSniper
                to help fellow movie lovers discover hidden gems and reconnect with their favorite genres.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20" style={{ backgroundColor: '#0F0E0D' }}>
        <div className="container mx-auto px-4">
          <Reveal>
            <SectionHeading icon={<Code className="w-4 h-4" />} title="Skills & Expertise" />
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <Reveal delay={0}>
              <SkillCard
                icon={<Globe size={22} strokeWidth={1.5} />}
                title="Web Development"
                description="Full-stack expertise using modern frameworks — React, TypeScript, Node.js, and more."
              />
            </Reveal>
            <Reveal delay={120}>
              <SkillCard
                icon={<Code size={22} strokeWidth={1.5} />}
                title="Machine Learning"
                description="Deep learning, NLP, and LLM-powered application development for real-world use cases."
              />
            </Reveal>
            <Reveal delay={240}>
              <SkillCard
                icon={<BookOpen size={22} strokeWidth={1.5} />}
                title="Technical Writing"
                description="Blog writing and instructional content creation for AI/ML and software development topics."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <SectionHeading icon={<Mail className="w-4 h-4" />} title="Get in Touch" />
          </Reveal>
          <Reveal delay={80}>
            <p className="font-body text-film-muted text-base mb-10 max-w-md leading-relaxed">
              Interested in collaborating or just want to say hi? Reach out through any of these channels.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex flex-wrap gap-3">
              <ContactButton href="mailto:25100055@lums.edu.pk" icon={<Mail className="w-4 h-4" />} label="Send an Email" />
              <ContactButton href="https://github.com/xoraizw" icon={<Github className="w-4 h-4" />} label="GitHub" />
              <ContactButton href="https://www.linkedin.com/in/xoraiz/" icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 text-center"
        style={{ borderTop: '1px solid rgba(255,248,235,0.05)' }}
      >
        <p className="font-body text-xs text-film-muted">
          &copy; 2024 MovieSniper — Built by Ahmad Xoraiz Waheed
        </p>
      </footer>
    </div>
  );
};

const SectionHeading: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px w-8 bg-film-gold opacity-60" />
      <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold flex items-center gap-1.5">
        {icon}
        {title}
      </span>
    </div>
    <h2 className="font-display text-3xl md:text-4xl font-bold text-film-cream">{title}</h2>
  </div>
);

const SkillCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon, title, description,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="p-7 transition-all duration-300"
      style={{
        backgroundColor: '#0A0908',
        border: `1px solid ${hovered ? 'rgba(196,150,58,0.25)' : 'rgba(255,248,235,0.07)'}`,
        borderRadius: '2px',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="inline-flex items-center justify-center w-12 h-12 mb-5 text-film-gold transition-colors duration-300"
        style={{
          backgroundColor: hovered ? 'rgba(196,150,58,0.12)' : 'rgba(196,150,58,0.07)',
          border: '1px solid rgba(196,150,58,0.2)',
          borderRadius: '2px',
        }}
      >
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-film-cream mb-2">{title}</h3>
      <p className="font-body text-film-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const SocialButton: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 font-body text-xs font-medium px-4 py-2 transition-all duration-200"
      style={{
        backgroundColor: hovered ? 'rgba(196,150,58,0.09)' : 'rgba(255,248,235,0.04)',
        border: `1px solid ${hovered ? 'rgba(196,150,58,0.3)' : 'rgba(255,248,235,0.08)'}`,
        color: hovered ? '#C4963A' : '#4D4743',
        borderRadius: '2px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {label}
    </a>
  );
};

const ContactButton: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 font-body text-sm font-medium px-6 py-3.5 transition-all duration-200"
      style={{
        backgroundColor: hovered ? 'rgba(196,150,58,0.09)' : '#131211',
        border: `1px solid ${hovered ? 'rgba(196,150,58,0.3)' : 'rgba(255,248,235,0.07)'}`,
        color: hovered ? '#C4963A' : '#B0A69C',
        borderRadius: '2px',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {label}
      <ExternalLink className="w-3.5 h-3.5 text-film-muted" />
    </a>
  );
};

export default AboutMePage;
