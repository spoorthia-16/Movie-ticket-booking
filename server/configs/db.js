import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`)
    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    }
}
export default connectDB