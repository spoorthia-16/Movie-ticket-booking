import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

//API to get now playing movies from TMDB pi
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    const movies = data.results;
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, movies: error.message });
  }
};

//API to add a new show to the database
export const addShow = async (req,res) =>{
    try {
        const {movieId, showsInput, showPrice} = req.body

        let movie = await Movie.findById(movieId)

        if(!movie) {
            //Fetch the movie details and credits from tmdb api
            const[movieDetailsResponse,movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`,{
              headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
          }),
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`,{    
          headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}})
        ]);
        const movieApiData = movieDetailsResponse.data;
        const movieCreditsData = movieCreditsResponse.data;

         const movieDetails = {
            _id : movieId,
            title: movieApiData.title,
            overview: movieApiData.overview,
            poster_path:movieApiData.poster_path,
            backdrop_path:movieApiData.backdrop_path,
            release_date:movieApiData.release_date,
            original_language:movieApiData.original_language,
            genres:movieApiData.genres,
            casts:movieApiData.casts,
            tagline:movieApiData.tagline || "",
            vote_average: movieApiData.vote_average,
            runtime:movieApiData.runtime,
         }

         //Add movie to the database
         movie = await Movie.create(movieDetails);
        }
        const showsToCreate = [];
        showsInput.forEach(show=>{
            const showDate = show.date;
            show.time.forEach((time)=>{
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });

        if(showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        }
        res.json({ success: true, movies: 'Show Added successfully' });
    } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, movies: error.message });
    }
}

//API to get all shows from the db
export const getShows = async(req,res)=>{
    try {
        const shows = await (await Show.find({showDateTime: {$gte: new Date()}}).populate('movie')).toSorted({ showDateTime: 1});

        //filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie))

        res.json({success:true, shows: Array.from(uniqueShows)})
    } catch (error) {
        console.error(error)
        res.json({success:false, message: error.message})
    }
}
//API to get a single show from the database