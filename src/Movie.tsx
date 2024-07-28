import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Slider from './Slider'; // Use the custom slider component
import Button from 'react-bootstrap/Button';
import './Movie.css'; // Ensure your CSS file is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner, faHome } from '@fortawesome/free-solid-svg-icons';

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

  if (loading) return <div className="loading-animation">
  <FontAwesomeIcon icon={faSpinner} spin size="2x" />
</div>;
  if (!movie) return <div>Movie not found</div>;
  return (
    <div className="movie-details">
      <Header />
      <FontAwesomeIcon icon={faArrowLeft} className="back-icon" onClick={() => navigate('/')} />
      <div className="movie-info">
        <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
        <div className="movie-details-text">
          <h2>{movie.Title}</h2>
          <p><strong>Description:</strong> {movie.Plot}</p>
          <p><strong>Release Date:</strong> {movie.Year}</p>
          <p><strong>Runtime:</strong> {movie.Runtime}</p>
          <p><strong>Genres:</strong> {movie.Genre}</p>
          <p><strong>Actors:</strong> {movie.Actors}</p>
          <a href={`https://www.imdb.com/title/${movie.imdbID}`} target="_blank" rel="noopener noreferrer">
            View on IMDb
          </a>
        </div>
      </div>
      <div className="genre-section">
        <h3>Genre Intensity</h3>
        <div className="genre-list">
          {movieGenres.map((genre) => (
            <div key={genre} className="genre-item">
              <span>{genre}</span>
              <Slider
                value={genreIntensities[genre] || 0}
                onChange={(value) => handleSliderChange(genre, value)}
                min={0}
                max={3}
                step={1}
              />
              <div className="slider-labels">
                <span>Low</span>
                <span>Neutral</span>
                <span>High</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="genre-grid">
        {remainingGenres.map((genre) => (
          <Button
            key={genre}
            variant={movieGenres.includes(genre) ? "primary" : "secondary"}
            onClick={() => handleGenreClick(genre)}
            className="genre-button"
          >
            {genre}
          </Button>
        ))}
      </div>
      <div className="recommendations-section">
        <h3>Recommendations</h3>
        <Button onClick={handleRecommend} className="genre-button">Get Recommendations</Button>
        {loadingRecommendations ? (
          <div className="loading-animation">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="card-container">
            {recommendations.map((rec) => (
              <div key={rec.imdbID} className="card" onClick={() => handleMovieClick(rec)}>
                <img src={rec.cover} alt={rec.title} className="card-img" />
                <div className="card-info">
                  <h4 className="card-title">{rec.title}</h4>
                  <p className="card-runtime">{rec.runtime}</p>
                  <p className="card-year">{rec.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MovieDetails;
