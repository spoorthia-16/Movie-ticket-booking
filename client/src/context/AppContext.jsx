import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ===============================
   AXIOS GLOBAL CONFIG
================================ */
axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

/* ===============================
   CONTEXT SETUP
================================ */
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /* ===============================
     CHECK ADMIN
  ================================ */
  const fetchIsAdmin = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access admin dashboard");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  /* ===============================
     FETCH SHOWS
  ================================ */
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to load shows");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("Failed to fetch shows");
    }
  };

  /* ===============================
     FETCH FAVORITES
  ================================ */
  const fetchFavoriteMovies = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setFavoriteMovies(data.movies);
      } else if (location.pathname === "/favorites") {
        toast.error(data.message);
      }
    } catch (error) {
      if (location.pathname === "/favorites") {
        toast.error("Failed to load favorites");
      }
      console.error(error.response?.data || error.message);
    }
  };

  /* ===============================
     EFFECTS
  ================================ */
  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    }
  }, [user]);

  /* ===============================
     CONTEXT VALUE
  ================================ */
  const value = {
    axios,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoriteMovies,
    fetchIsAdmin,
    fetchFavoriteMovies,
    image_base_url,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/* ===============================
   CUSTOM HOOK
================================ */
export const useAppContext = () => useContext(AppContext);
