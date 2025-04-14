const Product = require("../models/productModel");
const Category = require('../models/categoryModel')
const createHttpError = require("http-errors");
const mongoose = require("mongoose")

const addProduct = async (req, res, next) => {
  try {
    const { name, price, category } = req.body;

    const isCategoryAvailable = await  Category.findById(category)    

    if (!isCategoryAvailable) {
      const error = createHttpError(404, "There is no such category");
      return next(error);
    }

    const newProduct = new Product({ name, price, category: isCategoryAvailable._id });
    await newProduct.save();
    res
      .status(201)
      .json(newProduct);
  } catch (error) {
    console.log(error);
    
    next(error.message);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
    res.status(200).json( products);
  } catch (error) {
    next(error);
  }
};

const getOneProduct = async(req, res, next) => {
  try {
    const {id}  = req.params
    const product = await Product.findById(id)

    if(!product){
      const error = createHttpError(404, "There is no such product");
      return next(error);
    }
    res.status(200).json( product)
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        const error = createHttpError(404, "Invalid id!");
        return next(error);
    }

    const product = await Product.findByIdAndUpdate(
        id,
       req.body,
      { new: true }
    );

    if (!product) {
      const error = createHttpError(404, "Product not found!");
      return error;
    }

    res.status(200).json(product);

  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
    const {id} = req.params
    try {
        const product = await Product.findByIdAndDelete(id)
        if(!product){
            const error = createHttpError(400, 'Product not found')
            return error
        }
        res.status(200).json({message: 'Product deleted successfully'})

    } catch (error) {
        
    }
}

module.exports = { addProduct, getProducts, getOneProduct, updateProduct, deleteProduct };