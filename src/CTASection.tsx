import React from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal.tsx';

const CTASection: React.FC = () => (
  <section className="relative py-36 overflow-hidden bg-film-bg">
    {/* Warm radial glow from top-center */}
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,150,58,0.13) 0%, transparent 65%)',
      }}
    />
    {/* Top horizontal gold rule */}
    <div
      className="absolute top-0 inset-x-0 h-px z-0"
      style={{
        background: 'linear-gradient(to right, transparent, rgba(196,150,58,0.45), transparent)',
      }}
    />

    <div className="container mx-auto px-4 text-center relative z-10">
      {/* Eyebrow */}
      <Reveal delay={0}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-8 bg-film-gold" style={{ opacity: 0.5 }} />
          <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold">
            Free to Use
          </span>
          <div className="h-px w-8 bg-film-gold" style={{ opacity: 0.5 }} />
        </div>
      </Reveal>

      {/* Heading */}
      <Reveal delay={80} distance={48}>
        <h2
          className="font-display font-bold text-film-cream leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
        >
          Ready to find your<br />
          <em className="not-italic" style={{ color: '#C4963A' }}>next great film?</em>
        </h2>
      </Reveal>

      <Reveal delay={200}>
        <p className="font-body text-film-text text-lg mb-12 max-w-sm mx-auto leading-relaxed">
          No sign-up. No algorithms. Just great recommendations tailored to your taste.
        </p>
      </Reveal>

      {/* CTA button — outline fills on hover */}
      <Reveal delay={300}>
        <CTAButton />
      </Reveal>
    </div>
  </section>
);

const CTAButton: React.FC = () => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href="#"
      className="inline-flex items-center gap-3 font-body text-[11px] tracking-[0.18em] uppercase font-semibold px-9 py-4 transition-all duration-300 group"
      style={{
        border: '1px solid rgba(196,150,58,0.5)',
        color: hovered ? '#0A0908' : '#C4963A',
        backgroundColor: hovered ? '#C4963A' : 'transparent',
        borderRadius: '2px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Give it a try
      <ArrowRight
        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
        style={{ color: hovered ? '#0A0908' : '#C4963A' }}
      />
    </a>
  );
};

export default CTASection;
