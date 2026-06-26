import React, { useEffect, useRef, useState } from 'react';

type RevealMode = 'fade' | 'wipe';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  className?: string;
  mode?: RevealMode;
  scale?: boolean;
  distance?: number;
  duration?: number;
}

const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  mode = 'fade',
  scale = false,
  distance = 28,
  duration = 600,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Once the animation finishes, remove will-change so it no longer
  // creates a stacking context (which traps z-index of children like dropdowns).
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setSettled(true), delay + duration + 60);
    return () => clearTimeout(t);
  }, [visible, delay, duration]);

  const willChange = settled ? 'auto' : 'opacity, transform';

  if (mode === 'wipe') {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`} style={{ paddingBottom: '2px' }}>
        <div
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(110%)',
            transition: `transform ${duration}ms ${SPRING} ${delay}ms`,
            willChange,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  const translateMap: Record<string, string> = {
    up: `translateY(${distance}px)`,
    left: `translateX(-${distance}px)`,
    right: `translateX(${distance}px)`,
    none: 'none',
  };

  const initialTransform =
    direction === 'none' && !scale
      ? 'none'
      : `${translateMap[direction]}${scale ? ' scale(0.93)' : ''}`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : initialTransform,
        transition: `opacity ${duration}ms ${SPRING} ${delay}ms, transform ${duration}ms ${SPRING} ${delay}ms`,
        willChange,
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;
