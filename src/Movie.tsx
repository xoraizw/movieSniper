import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Film, Sliders, ExternalLink, Sparkles, ArrowLeft, Clock, Calendar, Users, Plus, X
} from 'lucide-react';
import Reveal from './Reveal.tsx';

const availableGenres = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Musical", "Mystery", "Romance", "Science Fiction",
  "Sport", "Thriller", "War", "Western"
];

interface MovieDetails {
  Title: string;
  Year: string;
  Plot: string;
  Runtime: string;
  Genre: string;
  Poster: string;
  imdbID: string;
  Actors: string;
}

interface RecommendedMovie {
  cover: string;
  title: string;
  runtime: string;
  year: string;
  imdbID: string;
}

const initialGenreIntensities = availableGenres.reduce<{ [key: string]: number }>((acc, genre) => {
  acc[genre] = 0;
  return acc;
}, {});

const MovieDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [movieGenres, setMovieGenres] = useState<string[]>([]);
  const [remainingGenres, setRemainingGenres] = useState<string[]>(availableGenres);
  const [genreIntensities, setGenreIntensities] = useState<{ [key: string]: number }>(initialGenreIntensities);
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async (imdbID: string) => {
      try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=9f6b847a`);
        const data = await response.json();
        if (data) {
          setMovie(data);
          const genres = data.Genre.split(', ').map((genre: string) => genre.trim());
          setMovieGenres(genres);
          setRemainingGenres(availableGenres.filter((genre) => !genres.includes(genre)));
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
      setLoading(false);
    };

    if (location.state) {
      const movieData = location.state as { imdbID: string };
      fetchMovieDetails(movieData.imdbID);
    }
  }, [location.state]);

  const handleSliderChange = (genre: string, value: number) => {
    setGenreIntensities(prev => ({ ...prev, [genre]: value }));
  };

  const handleGenreClick = (genre: string) => {
    setMovieGenres((prevGenres) => {
      if (prevGenres.includes(genre)) {
        setGenreIntensities(prev => ({ ...prev, [genre]: 0 }));
        return prevGenres.filter((g) => g !== genre);
      } else {
        setGenreIntensities(prev => ({ ...prev, [genre]: 0 }));
        return [...prevGenres, genre];
      }
    });
  };

  const handleRecommend = async () => {
    setLoadingRecommendations(true);
    setError(null);
    const requestData = { title: movie?.Title, genre_intensities: genreIntensities, top_n: 10 };

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? 'Failed to fetch recommendations');
      }

      const data = await response.json();

      const detailedRecommendations = data.map((rec: {
        title: string;
        imdb_id: string;
        poster_path: string;
        release_date: string;
        runtime: string;
      }) => ({
        cover: rec.poster_path,
        title: rec.title,
        runtime: rec.runtime,
        year: rec.release_date ? rec.release_date.split('-')[0] : '',
        imdbID: rec.imdb_id,
      }));

      setRecommendations(detailedRecommendations);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      setError(error.message ?? 'Failed to fetch recommendations. Please try again later.');
    }
    setLoadingRecommendations(false);
  };

  const handleMovieClick = (rec: RecommendedMovie) => {
    navigate('/movie', { state: { imdbID: rec.imdbID } });
    window.location.reload();
  };

  const genreIntensityRef = useRef<HTMLDivElement>(null);
  const scrollToGenreIntensity = () => {
    genreIntensityRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-film-bg gap-4">
      <div
        className="w-12 h-12 rounded-full border-2 animate-spin"
        style={{ borderColor: '#1A1917', borderTopColor: '#C4963A' }}
      />
      <p className="font-body text-film-muted text-sm">Loading movie details…</p>
    </div>
  );

  if (!movie) return (
    <div className="flex items-center justify-center h-screen bg-film-bg font-display text-film-cream text-xl">
      Movie not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-film-bg text-film-text">
      {/* Header */}
      <header
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: 'rgba(10,9,8,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,248,235,0.06)',
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-9 h-9 text-film-muted hover:text-film-cream transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255,248,235,0.04)',
              border: '1px solid rgba(255,248,235,0.07)',
              borderRadius: '2px',
            }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

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

          <nav className="ml-auto">
            <Link
              to="/aboutme"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-film-muted hover:text-film-cream transition-colors duration-200"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Movie Info */}
      <div className="container mx-auto px-4 py-10">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Poster */}
            <div className="md:col-span-1">
              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: '3px',
                  boxShadow: '0 0 0 1px rgba(255,248,235,0.08), 0 24px 48px rgba(0,0,0,0.6)',
                }}
              >
                {movie.Poster && movie.Poster !== 'N/A' ? (
                  <img src={movie.Poster} alt={movie.Title} className="w-full object-cover" />
                ) : (
                  <div
                    className="w-full aspect-[2/3] flex items-center justify-center text-film-muted"
                    style={{ backgroundColor: '#131211' }}
                  >
                    <Film size={64} strokeWidth={1} />
                  </div>
                )}
                {/* Subtle gold glow behind poster */}
                <div
                  className="absolute -inset-2 -z-10 blur-2xl"
                  style={{ backgroundColor: 'rgba(196,150,58,0.08)' }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 flex flex-col justify-center">
              <h1 className="font-display font-bold text-film-cream leading-tight mb-4"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                {movie.Title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-5">
                <Badge icon={<Calendar className="w-3.5 h-3.5" />} text={movie.Year} />
                <Badge icon={<Clock className="w-3.5 h-3.5" />} text={movie.Runtime} />
              </div>

              <p className="font-body text-film-text text-base leading-relaxed mb-5">{movie.Plot}</p>

              <div className="mb-3">
                <span className="font-body text-xs tracking-[0.15em] uppercase text-film-gold flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3.5 h-3.5" /> Cast
                </span>
                <p className="font-body text-film-muted text-sm">{movie.Actors}</p>
              </div>

              <div className="mb-7">
                <span className="font-body text-xs tracking-[0.15em] uppercase text-film-gold flex items-center gap-1.5 mb-2">
                  <Film className="w-3.5 h-3.5" /> Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.Genre.split(', ').map((g) => (
                    <span
                      key={g}
                      className="font-body text-xs font-medium px-3 py-1"
                      style={{
                        backgroundColor: 'rgba(196,150,58,0.1)',
                        border: '1px solid rgba(196,150,58,0.3)',
                        color: '#C4963A',
                        borderRadius: '2px',
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.imdb.com/title/${movie.imdbID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.15em] uppercase font-semibold px-5 py-3 transition-all duration-200"
                  style={{
                    backgroundColor: '#C4963A',
                    color: '#0A0908',
                    borderRadius: '2px',
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on IMDb
                </a>
                <button
                  onClick={scrollToGenreIntensity}
                  className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.15em] uppercase font-semibold px-5 py-3 text-film-muted hover:text-film-cream transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(255,248,235,0.04)',
                    border: '1px solid rgba(255,248,235,0.08)',
                    borderRadius: '2px',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Recommendations
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Genre Intensity */}
        <Reveal delay={100}>
          <div
            ref={genreIntensityRef}
            className="mt-14 p-8"
            style={{
              backgroundColor: '#131211',
              border: '1px solid rgba(255,248,235,0.07)',
              borderRadius: '3px',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-film-gold" strokeWidth={1.5} />
              <h2 className="font-display text-xl font-semibold text-film-cream">Genre Intensity</h2>
            </div>
            <p className="font-body text-film-muted text-sm mb-8">
              Drag sliders to increase or decrease the weight of each genre in your recommendations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {movieGenres.map((genre) => (
                <GenreSlider
                  key={genre}
                  genre={genre}
                  intensity={genreIntensities[genre]}
                  onSliderChange={handleSliderChange}
                  onRemove={() => handleGenreClick(genre)}
                />
              ))}
            </div>

            {remainingGenres.length > 0 && (
              <div className="mb-8">
                <p className="font-body text-[11px] tracking-[0.15em] uppercase text-film-muted mb-3">Add a genre</p>
                <div className="flex flex-wrap gap-2">
                  {remainingGenres.map((genre) => (
                    <button
                      key={genre}
                      className="inline-flex items-center gap-1 font-body text-xs font-medium px-3 py-1.5 text-film-muted hover:text-film-gold transition-all duration-200"
                      style={{
                        backgroundColor: 'rgba(255,248,235,0.03)',
                        border: '1px solid rgba(255,248,235,0.07)',
                        borderRadius: '2px',
                      }}
                      onClick={() => handleGenreClick(genre)}
                    >
                      <Plus className="w-3 h-3" />
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleRecommend}
              disabled={loadingRecommendations}
              className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.15em] uppercase font-semibold px-7 py-3.5 transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: '#C4963A',
                color: '#0A0908',
                borderRadius: '2px',
              }}
            >
              {loadingRecommendations ? (
                <>
                  <span
                    className="w-4 h-4 border-2 rounded-full animate-spin block"
                    style={{ borderColor: 'rgba(10,9,8,0.3)', borderTopColor: '#0A0908' }}
                  />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Recommendations
                </>
              )}
            </button>

            {error && (
              <div
                className="mt-4 flex items-center gap-2 font-body text-sm px-4 py-3"
                style={{
                  color: '#f87171',
                  backgroundColor: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: '2px',
                }}
              >
                {error}
              </div>
            )}
          </div>
        </Reveal>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-14">
            <Reveal>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-film-gold opacity-60" />
                <span className="font-body text-[11px] tracking-[0.25em] uppercase text-film-gold">
                  Recommended For You
                </span>
                <span className="font-body text-xs text-film-muted ml-auto">
                  {recommendations.length} films
                </span>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendations.map((rec, i) => (
                <Reveal key={rec.imdbID} delay={i * 60}>
                  <RecommendationCard movie={rec} onClick={() => handleMovieClick(rec)} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Badge: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div
    className="inline-flex items-center gap-1.5 font-body text-sm text-film-muted px-3 py-1"
    style={{
      backgroundColor: 'rgba(255,248,235,0.04)',
      border: '1px solid rgba(255,248,235,0.07)',
      borderRadius: '2px',
    }}
  >
    {icon}
    <span>{text}</span>
  </div>
);

const GenreSlider: React.FC<{
  genre: string;
  intensity: number;
  onSliderChange: (genre: string, value: number) => void;
  onRemove: () => void;
}> = ({ genre, intensity, onSliderChange, onRemove }) => {
  const fillPct = ((intensity + 3) / 6) * 100;
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: '#0A0908',
        border: '1px solid rgba(255,248,235,0.07)',
        borderRadius: '2px',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <strong className="font-body text-sm font-medium text-film-cream">{genre}</strong>
        <div className="flex items-center gap-2">
          <span
            className="font-body text-sm font-bold w-6 text-center"
            style={{ color: intensity > 0 ? '#C4963A' : intensity < 0 ? '#60a5fa' : '#4D4743' }}
          >
            {intensity > 0 ? `+${intensity}` : intensity}
          </span>
          <button
            onClick={onRemove}
            className="text-film-muted hover:text-red-400 transition-colors duration-200"
            aria-label={`Remove ${genre}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min="-3"
        max="3"
        step="1"
        value={intensity}
        onChange={(e) => onSliderChange(genre, Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #1A1917 ${fillPct}%, #1A1917 ${fillPct}%, #C4963A ${fillPct}%, #C4963A 100%)`,
        }}
      />
      <div className="flex justify-between font-body text-[10px] text-film-muted mt-1.5">
        <span>Less</span>
        <span>More</span>
      </div>
    </div>
  );
};

const RecommendationCard: React.FC<{ movie: RecommendedMovie; onClick: () => void }> = ({ movie, onClick }) => (
  <div
    className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
    onClick={onClick}
    style={{
      backgroundColor: '#131211',
      border: '1px solid rgba(255,248,235,0.07)',
      borderRadius: '2px',
      boxShadow: '0 0 0 0 rgba(196,150,58,0)',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,150,58,0.3)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,248,235,0.07)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 0 rgba(196,150,58,0)';
    }}
  >
    <div className="aspect-[2/3] overflow-hidden" style={{ backgroundColor: '#1A1917' }}>
      {movie.cover && movie.cover !== 'N/A' ? (
        <img
          src={movie.cover}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-film-muted">
          <Film size={40} strokeWidth={1} />
        </div>
      )}
    </div>

    {/* Hover overlay */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3"
      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}>
      <h3 className="font-display text-film-cream font-semibold text-sm leading-tight">{movie.title}</h3>
      <p className="font-body text-film-muted text-xs mt-0.5">{movie.year}</p>
    </div>

    {/* Always-visible bottom bar */}
    <div
      className="p-3 group-hover:opacity-0 transition-opacity duration-300"
      style={{ borderTop: '1px solid rgba(255,248,235,0.05)' }}
    >
      <h3 className="font-display text-film-cream font-semibold text-xs truncate">{movie.title}</h3>
      <p className="font-body text-film-muted text-xs mt-0.5">{movie.year}</p>
    </div>
  </div>
);

export default MovieDetails;
