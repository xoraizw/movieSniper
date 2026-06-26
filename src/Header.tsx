import React, { useState, useEffect, useRef } from 'react';
import { Film, X, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(10,9,8,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,248,235,0.06)' : '1px solid transparent',
      }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Brand — editorial masthead */}
        <Link to="/" className="flex items-center gap-2 group">
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
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-film-muted hover:text-film-cream transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features', isLink: false },
            { label: 'How It Works', href: '#how-it-works', isLink: false },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/aboutme"
            className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200"
          >
            About
          </Link>
        </nav>
      </div>

      {/* Mobile Nav */}
      <div
        ref={menuRef}
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isMenuOpen ? '200px' : '0',
          opacity: isMenuOpen ? 1 : 0,
          backgroundColor: '#0A0908',
          borderBottom: isMenuOpen ? '1px solid rgba(255,248,235,0.06)' : 'none',
        }}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <a
            href="#features"
            onClick={() => setIsMenuOpen(false)}
            className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsMenuOpen(false)}
            className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors"
          >
            How It Works
          </a>
          <Link
            to="/aboutme"
            onClick={() => setIsMenuOpen(false)}
            className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors"
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
