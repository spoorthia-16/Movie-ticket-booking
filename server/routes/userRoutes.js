import express from 'express';
import { getFavorite, getUserBookings, updateFavorite } from '../controllers/userController.js';
import { requireAuth } from "@clerk/express"; 

const userRouter = express.Router();

userRouter.get('/bookings', requireAuth(), getUserBookings);
userRouter.post('/update-favorite', requireAuth(), updateFavorite);
userRouter.get('/favorites', requireAuth(), getFavorite);

export default userRouter;
