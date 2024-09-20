import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Sparkles, Sliders, Brain } from 'lucide-react';
import FeatureCard from './FeatureCard.tsx';

interface Movie {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
}

interface HeroSectionProps {
  handleSearch: (e: React.FormEvent) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  offset: number;
  popularMovies: string[];
}

const HeroSection: React.FC<HeroSectionProps> = ({
  handleSearch,
  searchQuery,
  setSearchQuery,
  offset,
  popularMovies
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://www.omdbapi.com/?s=${searchQuery}&apikey=9f6b847a`);
        const data = await response.json();
        if (data.Search) {
          setMovies(data.Search.slice(0, 5)); // Display up to 5 results
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
      setLoading(false);
    };

    const debounceFetch = setTimeout(() => {
      if (searchQuery.length > 0) {
        fetchMovies();
      } else {
        setMovies([]);
      }
    }, 500); // Debounced search for efficiency

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  const handleMovieClick = (movie: Movie) => {
    navigate('/movie', { state: { imdbID: movie.imdbID } });
  };

  return (
    <>
      <section className="relative py-20 overflow-visible">
        {/* Marquee (running beneath search bar) */}
        <div
          className="absolute inset-0 flex flex-wrap content-start opacity-10 z-0"
          style={{
            transform: `translateY(-${offset}px)`,
            transition: 'transform 50ms linear',
          }}
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-full whitespace-nowrap">
              {popularMovies.map((movie, index) => (
                <span key={index} className="inline-block mx-4 text-3xl font-bold">
                  {movie}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 text-center relative z-10 pt-10">
          <h1 className="text-5xl font-bold mb-6">Discover Your Next Favorite Movie</h1>
          <p className="text-xl mb-8">MovieSniper uses advanced AI to recommend movies tailored just for you.</p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
            <div className="flex rounded-full overflow-hidden bg-white shadow-lg">
              <input
                type="text"
                placeholder="Search for a movie you like..."
                className="flex-grow px-6 py-4 text-gray-800 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-yellow-500 px-6 py-4 hover:bg-yellow-600 transition duration-300"
              >
                <Search size={24} className="text-gray-900" />
              </button>
            </div>

            {/* Loading spinner */}
            {loading && (
              <div className="absolute right-20 top-4 z-20">
                <FontAwesomeIcon icon={faSpinner} spin size="lg" className="text-gray-500" />
              </div>
            )}

            {/* Search Results */}
            {movies.length > 0 && (
              <div className="absolute w-full mt-4 z-50">
                <ul className="bg-gray-800 rounded-lg shadow-lg max-h-[70vh] overflow-y-auto">
                  {movies.map((movie) => (
                    <li
                      key={movie.imdbID}
                      className="flex items-center p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition duration-300"
                      onClick={() => handleMovieClick(movie)}
                    >
                      <img
                        src={movie.Poster}
                        alt={movie.Title}
                        className="w-16 h-24 object-cover mr-4 rounded shadow-md"
                      />
                      <div className="text-left flex-grow">
                        <h3 className="font-semibold text-yellow-500 text-lg mb-1">{movie.Title}</h3>
                        <p className="text-sm text-gray-400">{movie.Year}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>

        <div className="mb-16"></div>

        {/* Features Section */}
        <section id="features" className="bg-gray-800 py-20 relative z-0">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-yellow-500 flex items-center justify-center">
              <Sparkles className="mr-2" /> Why Choose MovieSniper?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Sparkles size={40} />}
                title="Vast Movie Database"
                description="Access recommendations from our extensive collection of films across all genres."
              />
              <FeatureCard
                icon={<Sliders size={40} />}
                title="Customizable Preferences"
                description="Fine-tune your genre preferences to get perfectly tailored recommendations."
              />
              <FeatureCard
                icon={<Brain size={40} />}
                title="AI-Powered Rankings"
                description="Our LLM technology ranks movies based on multiple factors for accurate suggestions."
              />
            </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default HeroSection;
