import express from "express";
import {
  addShow,
  getNowPlayingMovies,
  getShow,
  getShows,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

/* ===============================
   MOVIES FROM TMDB
================================ */
showRouter.get("/now-playing", getNowPlayingMovies);

/* ===============================
   ADMIN: ADD SHOW
================================ */
showRouter.post("/add", protectAdmin, addShow);

/* ===============================
   GET ALL UNIQUE SHOW MOVIES
================================ */
showRouter.get("/all", getShows);

/* ===============================
   GET SINGLE MOVIE SHOWS
================================ */
showRouter.get("/:movieId", getShow);

export default showRouter;
