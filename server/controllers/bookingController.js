import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import stripe from 'stripe'

//Function to check availability of selected seats for a movie
const checkSeatsAvailability = async(showId, selectedSeats)=>{
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}
export const createBooking = async(req,res)=>{
    try {
        const {origin} = req.headers;
        
        // Extract userId from the Clerk JWT in the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if(!token){
            return res.status(401).json({success:false,message:'Unauthorized. Please log in.'})
        }

        // Decode JWT payload (Clerk userId is stored in the 'sub' claim)
        let userId;
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
            userId = payload.sub;
        } catch {
            return res.status(401).json({success:false,message:'Invalid token. Please log in again.'})
        }

        if(!userId){
            return res.status(401).json({success:false,message:'Unauthorized. Please log in.'})
        }

        const {showId,selectedSeats} = req.body;

        //Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId,selectedSeats)

        if(!isAvailable){
            return res.json({success:false,message:"Selected seats are not available."})
        }
        //Get the show details
        const showData = await Show.findById(showId).populate('movie');

        //Create a new booking
        const booking = await Booking.create({
            user:userId,
            show:showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })
        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })
        showData.markModified('occupiedSeats');

        await showData.save();

         //Stripe Gateway  Initialize
         const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

         //Creating line items for stripe
         const line_items = [{
            price_data : {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount)*100
            },
            quantity:1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now()/1000) +30 *60, //Expires after 30 mins
         })

         booking.paymentLink = session.url
         await booking.save()

         //Run inngest Scheduler func to check payment status after 10 mins
         await inngest.send({
            name:"app/checkpayment",
            data: {
                bookingId:booking._id.toString()
            }
         })

         res.json({success:true, url: session.url})

    } catch (error) {
        const msg = (typeof error?.message === 'string' && error.message)
            ? error.message
            : error?.toString?.() || JSON.stringify(error) || 'Unknown error';
        console.error('[createBooking] ERROR msg:', msg, '\n', error);
        res.json({success:false, message: msg})
    }
}


export const getOccupiedSeats = async(req,res)=>{
    try {
        const{showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success:true,occupiedSeats})
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}