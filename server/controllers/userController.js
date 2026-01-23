import { clerkClient } from "@clerk/express";
import Booking from "../models/Bookings.js";
import Movie from "../models/Movie.js";

// Get User bookings
export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;
    const bookings = await Booking.find({ user })
      .populate({
        path: "show",
        populate: { path: "movie" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Add/Remove favorite (toggle)
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    // Ensure favorites array exists
    const favorites = user.privateMetadata.favorites || [];

    let msg = "";
    let updatedFavs = [];

    if (!favorites.includes(movieId)) {
      updatedFavs = [...favorites, movieId];
      msg = "Added to Favorites";
    } else {
      updatedFavs = favorites.filter(id => id !== movieId);
      msg = "Removed from Favorites";
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { favorites: updatedFavs }
    });

    return res.json({ success: true, message: msg, favorites: updatedFavs }); // send new list
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message }); // corrected error.msg → error.message
  }
};

// Fetch favorite movies
export const getFavorite = async (req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth().userId);
    const favorites = user.privateMetadata.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies, favorites });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
