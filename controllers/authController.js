import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";
import { JSDOM } from "jsdom";

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;
        if (!name) return res.status(400).send({ message: 'Name is Required' });
        if (!email) return res.status(400).send({ message: 'Email is Required' });
        if (!password) return res.status(400).send({ message: 'Password is Required' });
        if (!phone) return res.status(400).send({ message: 'Phone is Required' });
        if (!address) return res.status(400).send({ message: 'Address is Required' });
        if (!answer) return res.status(400).send({ message: 'Answer is Required' });

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'Already registered, please login',
            });
        }

        const hashedPassword = await hashPassword(password);
        const user = await new userModel({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            answer
        }).save();

        res.status(201).send({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in Registration',
            error
        });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email is not registered'
            });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Invalid password'
            });
        }

        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(200).send({
            success: true,
            message: 'login succesfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in login',
            error
        });
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body;
        if (!email) return res.status(400).send({ message: 'Email is Required' });
        if (!answer) return res.status(400).send({ message: 'Answer is Required' });
        if (!newPassword) return res.status(400).send({ message: 'New Password is Required' });

        const user = await userModel.findOne({ email, answer });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Wrong Email or Answer'
            });
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "Password Reset Successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went Wrong"
        });
    }
};

export const testController = (req, res) => {
    try {
        res.send('Protected Routes');
    } catch (error) {
        console.log(error);
        res.send({ error });
    }
};

export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);

        if (password && password.length < 6) {
            return res.json({ error: 'password is required  and greater than 6 character' });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address
        }, { new: true });
        res.status(200).send({
            success: true,
            message: 'profile updated successfully',
            updatedUser
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error getting in update profile controller",
            error
        });
    }
};

export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })
            .populate({
                path: 'products.product',
                select: 'name price'
            })
            .populate('buyer', 'name');
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while getting order',
            error,
        });
    }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate({ path: "products.product", select: "name price image" })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting order",
      error,
    });
  }
};


export const orderStatusController = async(req,res)=>{
    try{
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        res.json(orders);
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while Updating Order",
            error
        });
    }
}
