import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, Sliders, Brain, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from './FeatureCard.tsx';
import Reveal from './Reveal.tsx';

interface Movie {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
  votes?: number;
}

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  offset: number;
  popularMovies: string[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ searchQuery, setSearchQuery, offset, popularMovies }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const fetchMovies = useCallback(async (query: string) => {
    setLoading(true);
    setIsPending(false);
    try {
      const q = query.trim().toLowerCase();
      console.log('[Search] query:', q);

      const variantSet = new Set<string>([q]);
      if (!/[\s-]/.test(q) && q.length >= 6) {
        const mid = q.length / 2;
        const start = Math.max(3, Math.floor(mid) - 1);
        const end   = Math.min(q.length - 3, Math.ceil(mid) + 1);
        for (let i = start; i <= end; i++) {
          variantSet.add(q.slice(0, i) + ' ' + q.slice(i));
        }
      } else {
        if (q.includes('-')) variantSet.add(q.replace(/-/g, ' '));
        if (q.includes(' '))  variantSet.add(q.replace(/\s+/g, '-'));
      }
      const variants = [...variantSet];
      console.log('[Search] variants:', variants);

      const searchResults = await Promise.all(
        variants.map(async (v) => {
          const url = `https://www.omdbapi.com/?s=${encodeURIComponent(v)}&apikey=9f6b847a`;
          const res = await fetch(url);
          const data = await res.json();
          console.log(`[Search] "${v}":`, data.Search?.map((m: Movie) => m.Title) ?? data.Error);
          return (data.Search || []) as Movie[];
        })
      );

      const seen = new Set<string>();
      const candidates: Movie[] = searchResults
        .flat()
        .filter((m) => { if (seen.has(m.imdbID)) return false; seen.add(m.imdbID); return true; })
        .slice(0, 10)
        .map((m) => ({ ...m, Title: m.Title.replace(/^[^\w\s]+/g, '') }));

      console.log('[Search] candidates:', candidates.map(m => `${m.Title} (${m.Year})`));
      if (!candidates.length) { setMovies([]); setLoading(false); return; }

      const withVotes = await Promise.all(
        candidates.map(async (movie) => {
          try {
            const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=9f6b847a`);
            const detail = await res.json();
            const votes = detail.imdbVotes
              ? parseInt(detail.imdbVotes.replace(/,/g, ''), 10)
              : 0;
            console.log(`[Votes] ${movie.Title}: ${votes.toLocaleString()}`);
            return { ...movie, votes };
          } catch {
            return { ...movie, votes: 0 };
          }
        })
      );

      withVotes.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
      console.log('[Search] sorted:', withVotes.slice(0, 4).map(m => `${m.Title} — ${m.votes?.toLocaleString()}`));
      setMovies(withVotes.slice(0, 4));
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
    setLoading(false);
  }, []);

  // Debounce: fire 2s after the last keystroke
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setIsPending(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    setIsPending(true);
    debounceRef.current = setTimeout(() => {
      fetchMovies(searchQuery.trim());
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchMovies]);

  const handleMovieClick = (movie: Movie) => {
    navigate('/movie', { state: { imdbID: movie.imdbID } });
  };

  // Manual submit — cancel debounce and fire immediately
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchMovies(searchQuery.trim());
  };

  const handleClear = () => {
    setSearchQuery('');
    setMovies([]);
    setIsPending(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative z-20 min-h-[88vh] flex items-center overflow-visible py-20">
        {/* Scrolling film-title marquee */}
        <div
          className="absolute inset-0 flex flex-wrap content-start z-0 pointer-events-none select-none"
          style={{ transform: `translateY(-${offset}px)`, transition: 'transform 50ms linear', opacity: 0.032 }}
        >
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-full whitespace-nowrap">
              {popularMovies.map((movie, idx) => (
                <span
                  key={idx}
                  className="inline-block mx-6 font-display italic text-film-cream font-bold tracking-wide"
                  style={{ fontSize: '2.25rem' }}
                >
                  {movie}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-48 z-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0908)' }}
        />
        {/* Warm left glow */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 55% at 10% 70%, rgba(196,150,58,0.09) 0%, transparent 70%)' }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <Reveal delay={0}>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-film-gold" style={{ opacity: 0.65 }} />
                <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold">
                  AI-Powered Discovery
                </span>
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={80} distance={48}>
              <h1
                className="font-display font-bold text-film-cream leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
              >
                Discover<br />
                Your Next<br />
                <em className="not-italic" style={{ color: '#C4963A' }}>Favorite Film.</em>
              </h1>
            </Reveal>

            {/* Subheading */}
            <Reveal delay={200}>
              <p className="font-body text-film-text text-lg leading-relaxed mb-10 max-w-md">
                Tell us a movie you love. Our AI analyzes your taste and surfaces the perfect films you haven't seen yet.
              </p>
            </Reveal>

            {/* Search */}
            <Reveal delay={320}>
              <form onSubmit={handleSubmit} className="relative max-w-xl">
                <div
                  className="relative flex items-center bg-film-surface transition-all duration-300 focus-within:ring-1 focus-within:ring-film-gold/30"
                  style={{
                    border: '1px solid rgba(255,248,235,0.09)',
                    borderRadius: '3px',
                    boxShadow: 'inset 0 1px 0 rgba(255,248,235,0.03), 0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Search className="ml-4 w-4 h-4 flex-shrink-0 text-film-muted" />
                  <input
                    type="text"
                    placeholder="e.g. Blade Runner, Parasite, Goodfellas..."
                    className="flex-grow px-4 py-[15px] bg-transparent focus:outline-none font-body text-sm text-film-cream placeholder:text-film-muted"
                    style={{ caretColor: '#C4963A' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {/* Clear button — visible when there's input */}
                  {searchQuery && !loading && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex-shrink-0 mr-2 w-6 h-6 flex items-center justify-center rounded-full text-film-muted hover:text-film-cream transition-colors duration-150"
                      style={{ backgroundColor: 'rgba(255,248,235,0.06)' }}
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="m-1.5 px-5 py-[10px] font-body text-[11px] tracking-[0.15em] uppercase font-semibold bg-film-gold text-film-bg transition-all duration-200 disabled:opacity-50 hover:bg-film-gold-light flex items-center justify-center min-w-[72px]"
                    style={{ borderRadius: '2px' }}
                  >
                    {loading ? (
                      <span
                        className="w-4 h-4 border-2 rounded-full animate-spin block"
                        style={{ borderColor: 'rgba(10,9,8,0.3)', borderTopColor: '#0A0908' }}
                      />
                    ) : 'Search'}
                  </button>

                  {/* 2-second progress bar — fills while debounce timer counts down */}
                  {isPending && (
                    <div
                      key={searchQuery}
                      className="absolute bottom-0 left-0 h-[2px] rounded-sm"
                      style={{
                        backgroundColor: '#C4963A',
                        opacity: 0.55,
                        animation: 'searchProgress 2s linear forwards',
                      }}
                    />
                  )}
                </div>

                {/* Helper text below search */}
                <p
                  className="font-body text-[11px] text-film-muted mt-2 transition-opacity duration-300"
                  style={{ opacity: isPending ? 1 : 0.4 }}
                >
                  {isPending ? 'Press Search or wait' : 'Type to search automatically, or press Search'}
                </p>

                {/* Results dropdown */}
                {movies.length > 0 && (
                  <div className="absolute w-full mt-1 z-50">
                    <ul
                      className="overflow-hidden"
                      style={{
                        backgroundColor: '#0F0E0D',
                        border: '1px solid rgba(255,248,235,0.08)',
                        borderRadius: '3px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.75)',
                      }}
                    >
                      {movies.map((movie, idx) => (
                        <li
                          key={movie.imdbID}
                          className="flex items-center p-3 cursor-pointer transition-colors duration-150 group"
                          style={{
                            borderBottom: idx < movies.length - 1 ? '1px solid rgba(255,248,235,0.05)' : 'none',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1917')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                          onClick={() => handleMovieClick(movie)}
                        >
                          <div
                            className="flex-shrink-0 mr-3 overflow-hidden"
                            style={{ width: '36px', height: '54px', borderRadius: '2px', backgroundColor: '#1A1917' }}
                          >
                            {movie.Poster && movie.Poster !== 'N/A' ? (
                              <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-film-muted"
                                style={{ fontSize: '10px' }}>N/A</div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-display text-sm font-semibold text-film-cream truncate group-hover:text-film-gold transition-colors duration-150">
                              {movie.Title}
                            </h3>
                            <p className="font-body text-xs text-film-muted mt-0.5">{movie.Year}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="isolate relative py-24 bg-film-bg">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(196,150,58,0.04) 0%, transparent 70%)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-12">
            <Reveal mode="wipe" delay={0} duration={700}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-film-gold" style={{ opacity: 0.6 }} />
                <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold">
                  Why Movie Sniper
                </span>
              </div>
            </Reveal>
            <Reveal mode="wipe" delay={120} duration={750}>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-film-cream">
                Built for film lovers.
              </h2>
            </Reveal>
          </div>

          <div className="max-w-3xl">
            <FeatureCard
              index={0}
              delay={0}
              icon={<Sparkles size={18} />}
              title="Vast Movie Database"
              description="Access recommendations from our extensive collection of films across all genres and eras, from Hollywood classics to international cinema."
            />
            <FeatureCard
              index={1}
              delay={120}
              icon={<Sliders size={18} />}
              title="Customizable Preferences"
              description="Fine-tune the intensity of each genre using intuitive sliders — from subtle hints to strong preferences — and get results tailored exactly to your mood."
            />
            <FeatureCard
              index={2}
              delay={240}
              icon={<Brain size={18} />}
              title="AI-Powered Rankings"
              description="Our LLM technology analyzes your taste profile across multiple factors to surface the most relevant picks, ranked by how well they match you."
            />
            <div className="h-px" style={{ backgroundColor: 'rgba(255,248,235,0.07)' }} />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
