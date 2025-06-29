import { timeStamp } from 'console'
import mongoose from 'mongoose'
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    //SEO friendly banauna ko lagi slug lai add gareko
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.ObjectId,
        //hami sanga category ko model xa tei vayera objectid
        ref: 'Category',
        //category model ma last ma export ma j name xa tei halne yo garesi relation ship kam garxa otherwise  it donot work
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    shipping: {
        type: Boolean,
    }


}, { timestamps: true });
export default mongoose.model('Products', productSchema)