import React, { useEffect, useRef, useState } from 'react';
import { Search, Sliders, Sparkles } from 'lucide-react';
import Reveal from './Reveal.tsx';

const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: <Search size={16} strokeWidth={1.5} />,
    title: 'Search for a Movie',
    description: 'Start by searching for a movie you enjoy. This anchors our AI to your personal taste profile.',
  },
  {
    number: '02',
    icon: <Sliders size={16} strokeWidth={1.5} />,
    title: 'Adjust Preferences',
    description: 'Fine-tune the intensity of each genre using intuitive sliders — from subtle hints to strong preferences.',
  },
  {
    number: '03',
    icon: <Sparkles size={16} strokeWidth={1.5} />,
    title: 'Get Recommendations',
    description: 'Receive a ranked list of movies perfectly matched to your taste by our LLM engine.',
  },
];

const StepCard: React.FC<{ step: Step; delay: number }> = ({ step, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setEntered(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative pt-10 pb-6"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ${SPRING} ${delay}ms, transform 0.7s ${SPRING} ${delay}ms`,
        borderTop: '1px solid rgba(255,248,235,0.07)',
      }}
    >
      {/* Oversized decorative number — background */}
      <div className="overflow-hidden absolute top-2 right-0 pointer-events-none select-none">
        <span
          className="block font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(4.5rem, 9vw, 7rem)',
            color: 'rgba(196,150,58,0.07)',
            transform: entered ? 'translateY(0)' : 'translateY(110%)',
            transition: `transform 0.9s ${SPRING} ${delay + 60}ms`,
          }}
        >
          {step.number}
        </span>
      </div>

      {/* Step label + icon */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="overflow-hidden">
          <span
            className="block font-body text-[11px] tracking-[0.2em] uppercase"
            style={{
              color: '#C4963A',
              transform: entered ? 'translateY(0)' : 'translateY(110%)',
              transition: `transform 0.6s ${SPRING} ${delay + 100}ms`,
            }}
          >
            {step.number}
          </span>
        </div>
        <div
          className="text-film-muted"
          style={{
            opacity: entered ? 0.7 : 0,
            transition: `opacity 0.5s ${SPRING} ${delay + 150}ms`,
          }}
        >
          {step.icon}
        </div>
      </div>

      {/* Title wipes up */}
      <div className="overflow-hidden mb-3">
        <h3
          className="font-display text-xl font-semibold text-film-cream"
          style={{
            transform: entered ? 'translateY(0)' : 'translateY(110%)',
            transition: `transform 0.65s ${SPRING} ${delay + 180}ms`,
          }}
        >
          {step.title}
        </h3>
      </div>

      {/* Description fades */}
      <p
        className="font-body text-sm text-film-text leading-relaxed"
        style={{
          maxWidth: '22rem',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(10px)',
          transition: `opacity 0.6s ${SPRING} ${delay + 280}ms, transform 0.6s ${SPRING} ${delay + 280}ms`,
        }}
      >
        {step.description}
      </p>
    </div>
  );
};

const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="isolate py-24 bg-film-bg">
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(196,150,58,0.04) 0%, transparent 70%)' }}
    />
    <div className="container mx-auto px-4">
      <div className="mb-16">
        <Reveal mode="wipe" delay={0} duration={700}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-film-gold" style={{ opacity: 0.6 }} />
            <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold">
              Simple Process
            </span>
          </div>
        </Reveal>
        <Reveal mode="wipe" delay={120} duration={750}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-film-cream">
            How it works.
          </h2>
        </Reveal>
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-16">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} delay={i * 150} />
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
