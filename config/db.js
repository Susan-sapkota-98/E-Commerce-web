import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connected To mongodb database ${conn.connection.host}`.bgYellow.white);

    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white)
    }
};
export default connectDB;