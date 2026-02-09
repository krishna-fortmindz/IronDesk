import mongoose from 'mongoose';

const connectionToDb = async () => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Mongodb connected with server: ${mongoose.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log("MongoDB Connection Error: ", error);
        throw error;
    }
}
export default connectionToDb;