import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
        // if we use trim true then all whitespace are removed
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: {},
        required: true
    },
    answer: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        default: 0,
    }

}, { timestamps: true })
//use of timestamps:true = jaba new user create hunxa usko created time add hunxa.
export default mongoose.model('users', userSchema)