import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

/* ===============================
   NOW PLAYING MOVIES (TMDB)
================================ */
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        family: 4,
      }
    );

    res.status(200).json({
      success: true,
      movies: data.results,
    });
  } catch (error) {
    console.error("TMDB ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   ADD SHOW (ADMIN)
================================ */
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    // If movie not in DB, fetch from TMDB
    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      movie = await Movie.create({
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      });
    }

    // Create shows
    const showsToCreate = [];

    showsInput.forEach((show) => {
      show.time.forEach((time) => {
        const dateTimeString = `${show.date}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length) {
      await Show.insertMany(showsToCreate);
    }

    res.status(201).json({
      success: true,
      message: "Show added successfully",
    });
  } catch (error) {
    console.error("ADD SHOW ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   GET ALL UNIQUE SHOW MOVIES
================================ */
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({})
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMoviesMap = new Map();

    shows.forEach((show) => {
      if (show.movie && !uniqueMoviesMap.has(show.movie._id.toString())) {
        uniqueMoviesMap.set(show.movie._id.toString(), show.movie);
      }
    });

    res.status(200).json({
      success: true,
      shows: Array.from(uniqueMoviesMap.values()),
    });
  } catch (error) {
    console.error("GET SHOWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   GET SINGLE MOVIE SHOWS
================================ */
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);
    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];

      if (!dateTime[date]) dateTime[date] = [];

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
      });
    });

    res.status(200).json({
      success: true,
      movie,
      dateTime,
    });
  } catch (error) {
    console.error("GET SHOW ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
