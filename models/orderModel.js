// models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, // referenced product
            quantity: { type: Number, required: true },
        },
    ],
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // referenced buyer
    status: { type: String, default: 'Pending', enum:["Not process","Processing","Shipped","delivered","cancel"], },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const orderModel = mongoose.model('order', orderSchema);

export default orderModel;
