import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Film, Sliders, ThumbsUp, Zap, ExternalLink, Sparkles, Brain, User, ArrowLeft, Clock, Calendar, Users, Star, ChevronDown } from 'lucide-react';
import Header from './Header';

// ... (previous imports and interfaces remain the same)

const MovieDetails: React.FC = () => {
  // ... (previous state declarations remain the same)
  const [fullHDPoster, setFullHDPoster] = useState<string | null>(null);

  useEffect(() => {
    // ... (previous useEffect logic remains the same)

    // Add this new effect for fetching the full HD poster
    if (movie) {
      fetchFullHDPoster(movie.Title, movie.Year);
    }
  }, [location.state, movie]);

  const fetchFullHDPoster = async (title: string, year: string) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=YOUR_TMDB_API_KEY&query=${encodeURIComponent(title)}&year=${year}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const posterPath = data.results[0].poster_path;
        if (posterPath) {
          setFullHDPoster(`https://image.tmdb.org/t/p/original${posterPath}`);
        }
      }
    } catch (error) {
      console.error('Error fetching full HD poster:', error);
    }
  };

  // ... (other functions remain the same)

  if (loading) return (
    // ... (loading state remains the same)
  );

  if (!movie) return <div className="text-white">Movie not found</div>;

  return (
    <>
      <header className="relative z-50 container mx-auto px-4 py-6 flex justify-between items-center bg-gray-900 text-white">
        {/* ... (header content remains the same) */}
      </header>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-300 bg-gray-800 px-4 py-2 rounded-full shadow-lg"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-yellow-500">{movie.Title}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <img 
                src={fullHDPoster || movie.Poster} 
                alt={movie.Title} 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="md:col-span-2">
              {/* ... (rest of the movie details remain the same) */}
            </div>
          </div>

          {/* ... (rest of the component remains the same) */}
        </div>
      </div>
    </>
  );
};

// ... (Badge and GenreSlider components remain the same)

export default MovieDetails;