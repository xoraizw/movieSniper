import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Search.css'; // Include the updated CSS file for new styling

interface Movie {
  Title: string;
  Year: string;
  Plot: string;
  Runtime: string;
  Genre: string;
  Poster: string;
  imdbID: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=9f6b847a`);
        const data = await response.json();
        if (data.Search) {
          setMovies(data.Search.slice(0, 3));
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
      setLoading(false);
    };

    const debounceFetch = setTimeout(() => {
      if (query.length > 0) {
        fetchMovies();
      }
    }, 2000); // Debounce delay to avoid overloading the API

    return () => clearTimeout(debounceFetch);
  }, [query]);

  const handleMovieClick = (movie: Movie) => {
    navigate('/movie', { state: { imdbID: movie.imdbID } });
  };

  return (
    <div className="search-container">
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search movies"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <button className="search-button" onClick={() => {}}>
          Search
        </button>
      </div>

      {loading && (
        <div className="loading-animation">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      )}
      
      {movies.length > 0 && (
        <ul className="search-results">
          {movies.map((movie) => (
            <li key={movie.imdbID} className="search-result-item" onClick={() => handleMovieClick(movie)}>
              <img src={movie.Poster} alt={movie.Title} className="search-result-poster" />
              <div>
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
