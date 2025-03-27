const Product = require("../models/productModel");
const Category = require('../models/categoryModel')
const createHttpError = require("http-errors");
const mongoose = require("mongoose")

const addCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await Category.findOne({name})
    if(category){
        const error = createHttpError(400, "Category is already available");
      return next(error);
    }

    const newCategory = new Category({ name });
    await newCategory.save();
    res
      .status(201)
      .json(newCategory);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
  } catch (error) {
    next(error);
  }
};

const getOneCategory = async (req, res, next) => {
  try {
    const {id} = req.params
    const category = await Category.findById(id)
    const products = await Product.find({category: id})

    res.status(200).json({category, products})
  } catch (error) {
    console.error(error)
    next(error)
  }
}

const updateCategory = async (req, res, next) => {
  try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        const error = createHttpError(404, "Invalid id!");
        return next(error);
    }

    const category = await Category.findByIdAndUpdate(
        id,
       req.body,
      { new: true }
    );

    if (!category) {
      const error = createHttpError(404, "Category not found!");
      return error;
    }

    res.status(200).json(category);

  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
      const category = await Category.findById(id);
      if (!category) {
          return next(createHttpError(400, "Category not found"));
      }

      const foods = await Product.find({ category: category._id });

      if (foods.length > 0) {
          await Promise.all(
              foods.map((item) => Product.findByIdAndDelete(item._id))
          );
      }

      await Category.findByIdAndDelete(id);

      res.status(200).json({ message: "Category deleted successfully" });

  } catch (error) {
      next(error);
  }
};


module.exports = { addCategory, getCategories, updateCategory, deleteCategory, getOneCategory };