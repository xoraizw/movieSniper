import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Film, Sliders, ExternalLink, Sparkles, User, ArrowLeft, Clock, Calendar, Users} from 'lucide-react';
import FilmLogo from './film.png'

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

// Create an initial genre intensities object with all genres set to 0
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
    setGenreIntensities(prev => {
      const updatedIntensities = { ...prev, [genre]: value };
      return updatedIntensities;
    });
  };

  const handleGenreClick = (genre: string) => {
    setMovieGenres((prevGenres) => {
      if (prevGenres.includes(genre)) {
        setGenreIntensities((prevIntensities) => {
          const updatedIntensities = { ...prevIntensities, [genre]: 0 };
          return updatedIntensities;
        });
        return prevGenres.filter((g) => g !== genre);
      } else {
        setGenreIntensities((prevIntensities) => {
          const updatedIntensities = { ...prevIntensities, [genre]: 0 };
          return updatedIntensities;
        });
        return [...prevGenres, genre];
      }
    });
  };

  const handleRecommend = async () => {
    setLoadingRecommendations(true);
    const requestData = {
      title: movie?.Title,
      genre_intensities: genreIntensities,
      top_n: 10
    };

    try {
      const response = await fetch('https://xoraiz.pythonanywhere.com/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();

      const detailedRecommendations = await Promise.all(
        data.map(async (rec: { title: string }) => {
          const omdbResponse = await fetch(`https://www.omdbapi.com/?t=${rec.title}&apikey=9f6b847a`);
          const omdbData = await omdbResponse.json();
          return {
            cover: omdbData.Poster,
            title: omdbData.Title,
            runtime: omdbData.Runtime,
            year: omdbData.Year,
            imdbID: omdbData.imdbID,
          };
        })
      );

      setRecommendations(detailedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch recommendations. Please try again later.');
    }
    setLoadingRecommendations(false);
  };

  const handleMovieClick = (movie: RecommendedMovie) => {
    navigate('/movie', { state: { imdbID: movie.imdbID } });
    window.location.reload();
  };

  const genreIntensityRef = useRef<HTMLDivElement>(null);

  const scrollToGenreIntensity = () => {
    genreIntensityRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  );

  if (!movie) return <div className="text-white">Movie not found</div>;

  return (
    <>
      <header className="relative z-50 container mx-auto px-4 py-3 flex items-center bg-gray-900 text-white">
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-300 mr-4"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center space-x-0">
          <img src={FilmLogo} alt="movieSniper logo" className="w-12 h-12" />
          <div className="text-2xl font-bold text-yellow-500"> <a href="/" className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"> movieSniper </a> </div>
        </div>
        
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a
                href="/aboutme"
                className="flex items-center hover:text-yellow-500 space-x-2 transition-colors duration-300"
              >
                <User className="w-5 h-5" />
                <span>About Me</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <img src={movie.Poster} alt={movie.Title} className="w-full rounded-lg shadow-lg" />
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-yellow-500">{movie.Title}</h1>
            <div className="flex flex-wrap gap-4 mb-4">
              <Badge icon={<Calendar className="mr-1" />} text={movie.Year} />
              <Badge icon={<Clock className="mr-1" />} text={movie.Runtime} />
            </div>
            <p className="text-lg mb-4">{movie.Plot}</p>
            <div className="mb-4">
              <strong className="font-semibold text-yellow-500">
                <Users className="inline mr-2" />
                Cast:
              </strong> {movie.Actors}
            </div>
            <div className="mb-4">
              <strong className="font-semibold text-yellow-500">
                <Film className="inline mr-2" />
                Genres:
              </strong> {movie.Genre}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <a
                href={`https://www.imdb.com/title/${movie.imdbID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-yellow-600 transition duration-300"
              >
                <ExternalLink className="mr-2" size={20} />
                <span>View on IMDb</span>
              </a>
              <button
                onClick={scrollToGenreIntensity}
                className="inline-flex items-center bg-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-yellow-600 transition duration-300"
              >
                <span>Get Recommendations</span>
              </button>
            </div>

          </div>
        </div>

        <div ref={genreIntensityRef} className="mt-12 bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-yellow-500 flex items-center">
            <Sliders className="mr-2" />
            Genre Intensity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movieGenres.map((genre) => (
              <GenreSlider
                key={genre}
                genre={genre}
                intensity={genreIntensities[genre]}
                onSliderChange={handleSliderChange}
              />
            ))}
          </div>
          <div className="flex flex-wrap mt-4 gap-2">
            {remainingGenres.map((genre) => (
              <button
                key={genre}
                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-yellow-600 transition duration-300"
                onClick={() => handleGenreClick(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <button
              onClick={handleRecommend}
              className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition duration-300 flex items-center"
            >
              <Sparkles className="mr-2" />
              Generate Recommendations
            </button>
            {loadingRecommendations && <p className="text-yellow-500 mt-4">Loading recommendations...</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-yellow-500">Recommended Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((movie) => (
          <div
            key={movie.imdbID}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer shadow-lg hover:shadow-xl transition duration-300"
            onClick={() => handleMovieClick(movie)}
          >
            <div className="h-96 w-full mb-4 relative">
              <img
                src={movie.cover}
                alt={movie.title}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-500">{movie.title}</h3>
              <p className="text-sm text-gray-400">{movie.runtime} • {movie.year}</p>
            </div>
          </div>
        ))}
      </div>

          </div>
        )}
      </div>
    </div>
    </>
  );
};

const Badge: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="inline-flex items-center bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm">
    {icon}
    <span>{text}</span>
  </div>
);

const GenreSlider: React.FC<{
  genre: string;
  intensity: number;
  onSliderChange: (genre: string, value: number) => void;
}> = ({ genre, intensity, onSliderChange }) => (
  <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
    <div className="flex justify-between items-center mb-2">
      <strong className="text-yellow-500">{genre}</strong>
      <span className="text-gray-400">{intensity}</span>
    </div>
    <input
      type="range"
      min="-3"
      max="3"
      value={intensity}
      onChange={(e) => onSliderChange(genre, Number(e.target.value))}
      className="w-full"
    />
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>Low Intensity</span>
      <span>High Intensity</span>
    </div>
  </div>
);

export default MovieDetails;
