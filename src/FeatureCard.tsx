import React, { useEffect, useRef, useState } from 'react';

const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  index?: number;
}> = ({ title, description, delay = 0, index = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  const num = String(index + 1).padStart(2, '0');

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
      className="group relative py-10 flex gap-8 md:gap-14 items-start"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ${SPRING} ${delay}ms, transform 0.7s ${SPRING} ${delay}ms`,
        borderTop: '1px solid rgba(255,248,235,0.07)',
      }}
    >
      {/* Ordinal number */}
      <div className="overflow-hidden flex-shrink-0 w-14 md:w-16 pt-1">
        <span
          className="block font-display font-bold leading-none select-none"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            color: 'rgba(196,150,58,0.28)',
            transform: entered ? 'translateY(0)' : 'translateY(110%)',
            transition: `transform 0.65s ${SPRING} ${delay + 80}ms`,
          }}
        >
          {num}
        </span>
      </div>

      {/* Text content */}
      <div className="flex-grow">
        {/* Title wipes up */}
        <div className="overflow-hidden mb-3">
          <h3
            className="font-display text-xl md:text-2xl font-semibold text-film-cream leading-tight"
            style={{
              transform: entered ? 'translateY(0)' : 'translateY(110%)',
              transition: `transform 0.65s ${SPRING} ${delay + 160}ms`,
            }}
          >
            {title}
          </h3>
        </div>

        {/* Description fades in */}
        <p
          className="font-body text-film-text text-sm leading-relaxed max-w-sm"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 0.6s ${SPRING} ${delay + 260}ms, transform 0.6s ${SPRING} ${delay + 260}ms`,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
