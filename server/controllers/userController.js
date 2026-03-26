import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";

// Helper: extract Clerk userId from Bearer JWT in Authorization header
const getUserIdFromToken = (req) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return null;
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
        return payload.sub || null;
    } catch {
        return null;
    }
};

//API Controller function to Get User Bookings
export const getUserBookings = async(req,res)=>{
    try {
        const userId = getUserIdFromToken(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }

        const bookings = await Booking.find({ user: userId }).populate({
            path: "show",
            populate: {path:"movie"}
        }).sort({ createdAt: -1 })
        res.json({success:true,bookings})
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success:false,message: 'Failed to get bookings'});
    }
}

//API Controller function to Update favorite movie in MongoDB User
export const updateFavorite = async(req,res)=>{
    try {
        const { movieId } = req.body;
        const userId = getUserIdFromToken(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const favorites = user.favorites || [];

        let message;
        if (favorites.includes(movieId)) {
            // Remove from favorites
            user.favorites = favorites.filter(id => id !== movieId);
            message = "Removed from favorites";
        } else {
            // Add to favorites
            user.favorites = [...favorites, movieId];
            message = "Added to favorites";
        }

        await user.save();
        res.json({success:true, message})
    } catch (error) {
        console.error("Error updating favorite:", error.message);
        res.status(500).json({success:false,message: error.message || 'Failed to update favorites'});
    }
}

export const getFavorites = async(req,res)=>{
    try {
        const userId = getUserIdFromToken(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const favorites = user.favorites || [];

        //Getting movies from database
        const movies = await Movie.find({_id: {$in: favorites}})
        res.json({success:true, movies})
    } catch (error) {
        console.error("Error fetching favorites:", error.message);
        res.status(500).json({success:false,message: error.message || 'Failed to fetch favorites'});
    }
}