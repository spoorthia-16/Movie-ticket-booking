import { Heart, StarIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url, user, axios, getToken, favoriteMovies, fetchFavoriteMovies } = useAppContext();

  const handleNavigate = () => {
    navigate(`/movies/${movie._id}`);
    window.scrollTo(0, 0);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (!user) return toast.error("Please login to proceed");

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId: movie._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      } else {
        toast.error(data.message || "Failed to update favorite");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating favorite");
    }
  };

  const isFavorite = favoriteMovies.some((fav) => fav._id === movie._id);

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66">
      
      <img
        onClick={handleNavigate}
        src={image_base_url + movie.backdrop_path}
        alt={movie.title}
        className="rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer"
      />

      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      <p className="text-sm text-gray-400 mt-2">
        {movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : "N/A"}{" "}
        •{" "}
        {movie.genres?.length
          ? movie.genres.slice(0, 2).map((g) => g.name).join(" | ")
          : "Genre"}{" "}
        • {movie.runtime ? timeFormat(movie.runtime) : "N/A"}
      </p>

      <div className="flex items-center justify-between mt-4 pb-3">
        <button
          onClick={handleNavigate}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <div className="flex items-center gap-3">
          <p className="flex items-center gap-1 text-sm text-gray-400 mt-1">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
            {movie.vote_average
              ? movie.vote_average.toFixed(1)
              : "0.0"}
          </p>

          <button
            onClick={handleFavorite}
            className="p-1 rounded-full hover:text-primary transition"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-5 h-5 transition ${
                isFavorite ? "fill-primary text-primary" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;