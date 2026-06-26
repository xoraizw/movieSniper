import React from 'react';
import { Github, Linkedin, Mail, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal.tsx';

const SocialLink: React.FC<{ icon: React.ReactNode; href: string; label: string }> = ({ icon, href, label }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 transition-all duration-200"
      style={{
        backgroundColor: hovered ? 'rgba(196,150,58,0.09)' : 'rgba(255,248,235,0.04)',
        border: `1px solid ${hovered ? 'rgba(196,150,58,0.3)' : 'rgba(255,248,235,0.07)'}`,
        borderRadius: '2px',
        color: hovered ? '#C4963A' : '#4D4743',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
    </a>
  );
};

const Footer: React.FC = () => (
  <footer
    className="bg-film-bg"
    style={{ borderTop: '1px solid rgba(255,248,235,0.06)' }}
  >
    <div className="container mx-auto px-4 py-16">
      <Reveal>
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-4 h-4 text-film-gold" strokeWidth={1.5} style={{ opacity: 0.8 }} />
              <span className="font-body text-xs font-light tracking-[0.22em] text-film-muted uppercase leading-none">
                movie
              </span>
              <span
                className="font-display italic font-bold text-film-gold leading-none"
                style={{ fontSize: '1rem', letterSpacing: '-0.01em', marginLeft: '-2px' }}
              >
                Sniper
              </span>
            </div>
            <p className="font-body text-film-muted text-sm leading-relaxed max-w-xs">
              AI-powered movie recommendations. Discover hidden gems and new favorites based on what you already love.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted mb-5">Explore</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="font-body text-sm text-film-muted hover:text-film-gold transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="font-body text-sm text-film-muted hover:text-film-gold transition-colors duration-200">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/aboutme" className="font-body text-sm text-film-muted hover:text-film-gold transition-colors duration-200">
                  About the Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted mb-5">Connect</h4>
            <div className="flex gap-2.5">
              <SocialLink icon={<Github className="w-4 h-4" />} href="https://github.com/xoraizw" label="GitHub" />
              <SocialLink icon={<Linkedin className="w-4 h-4" />} href="https://www.linkedin.com/in/xoraiz/" label="LinkedIn" />
              <SocialLink icon={<Mail className="w-4 h-4" />} href="mailto:25100055@lums.edu.pk" label="Email" />
            </div>
          </div>
        </div>
      </Reveal>

      <div
        className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2"
        style={{ borderTop: '1px solid rgba(255,248,235,0.05)' }}
      >
        <p className="font-body text-xs text-film-muted">&copy; 2024 MovieSniper. All rights reserved.</p>
        <p className="font-body text-xs text-film-muted">
          Built by{' '}
          <a
            href="https://github.com/xoraizw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-film-muted hover:text-film-gold transition-colors duration-200"
          >
            Ahmad Xoraiz Waheed
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
