import { error } from "console";
import productModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";

import fs from 'fs'
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
//file import
export const createProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { photo } = req.files
        // ========const express = require('express');
        // const formidableMiddleware = require('express-formidable');

        // var app = express();

        // app.use(formidableMiddleware());

        // app.post('/upload', (req, res) => {
        //   req.fields; // contains non-file fields
        //   req.files; // contains files
        // });====== yo chai formidable ko  kasari use garne vanera ho yo bare bujhna ko lagi https://www.npmjs.com/package/express-formidable } 

        //validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Name is Required' })
            case !description:
                return res.status(500).send({ error: 'description is Required' })
            case !price:
                return res.status(500).send({ error: 'price is Required' })
            case !category:
                return res.status(500).send({ error: 'category is Required' })
            case !quantity:
                return res.status(500).send({ error: 'quantity is Required' })
            case photo && photo.size > 2000000:
                return res.status(500).send({ error: 'Photo is Required and should be less that 2mb' })
        }

        const products = new productModel({ ...req.fields, slug: slugify(name) })
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'product creates successfully',
            products,
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error create product',
            error,
        });

    }
};

// get all product 
export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').select("-photo").limit(12).sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            countTotal: products.length,
            message: "All Products",
            products,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting product",
            error: error.message
        })
    }
};

//get single product
export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).select('-photo').populate('category')
        res.status(200).send({
            success: true,
            message: 'single product fetched',
            product,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error getting in single product controller',
            error

        })
    }
}
export const productPhotoController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select('photo')
        if (product.photo.data) {
            res.set('Content-type', product.photo.contentType)
            return res.status(200).send(product.photo.data)
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in product photo',
            error

        })
    }
}
export const deleteProductController = async (req, res) => {
    try {
        const { pid } = req.params;
        //destructure
        await productModel.findByIdAndDelete(pid).select('-photo');
        res.status(200).send({
            success: true,
            message: ' product deleted successfully',
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error during deleting product',
            error
        })
    }
}

//Update Product

export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { photo } = req.files
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Name is Required' })
            case !description:
                return res.status(500).send({ error: 'description is Required' })
            case !price:
                return res.status(500).send({ error: 'price is Required' })
            case !category:
                return res.status(500).send({ error: 'category is Required' })
            case !quantity:
                return res.status(500).send({ error: 'quantity is Required' })
            case photo && photo.size > 2000000:
                return res.status(500).send({ error: 'Photo is Required and should be less that 2mb' })
        }

        const products = await productModel.findByIdAndUpdate(req.params.pid,
            { ...req.fields, slug: slugify(name) }, { new: true }
        )
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'product update successfully',
            products,
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error update product',
            error,
        });

    }
};
//product filters controller
export const productFiltersController = async (req, res) => {
    try {
        const { checked, radio } = req.body
        let args = {}
        if (checked.length > 0) args.category = checked
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }
        // gte=greater than or equal to
        const products = await productModel.find(args)
        res.status(200).send({
            success: true,
            products,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while filtering products',
            error,
        });

    }
}

//product counts controller
export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total,
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in product count',
            error,
        });

    }

}
//product per page controller

export const productListController = async (req, res) => {
    try {
        const perPage = 4
        //yeuta page ma 6 ota hunxa vanera dekhayeko
        const page = req.params.page ? req.params.page : 1
        const products = await productModel.find({}).select('-photo').skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 });
        // select('-photo) yesko kam chai photo lai deselect garnu ho yesle chai photo lai dekhaudaina
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in per page controller',
            error,
        });
    }
}

//search product controller

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params
        const result = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
            ]
        }).select('-photo')
        res.json(result)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in search product controller',
            error,
        });
    }
}

// related Product Controller
export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params
        const products = await productModel.find({
            category: cid, _id: { $ne: pid }
        }).select('-photo').limit(2).populate('category')
        res.status(200).send({
            success: true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in related product controller',
            error,
        });
    }
}
// product Category Controller
export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        const products = await productModel.find({ category }).populate('category')

        res.status(200).send({
            success: true,
            category,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in related product category controller',
            error,
        });
    }
}