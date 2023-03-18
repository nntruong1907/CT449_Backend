const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const ProductService = require("../services/product.service");
const cloudinary = require('cloudinary').v2;

// Create and Save a new Product
exports.create = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "Image can not be empty"));
  }
  try {
    const fileData = req.file
    const productService = new ProductService(MongoDB.client);
    if (!req.body.quantity) {
      cloudinary.uploader.destroy(fileData.filename)
      return next(new ApiError(400, "Quantity can not be empty"));
    }
    const product = await productService.findByName(req.body);
    if (product) {
      cloudinary.uploader.destroy(fileData.filename)
      return next(new ApiError(400, "Product already exists"));
    }
    const document = await productService.create({ ...req.body, path: fileData?.path, filename: fileData?.filename });
    console.log("🚀 ~ file: product.controller.js:24 ~ exports.create= ~ document:", document)
    return res.send(document);

  } catch (error) {
    console.log(error)
    cloudinary.uploader.destroy(req.file.filename)
    return next(
      new ApiError(500, "An error occurred while creating the product")
    );
  }
};

// Retrieve all products from the database
exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const productService = new ProductService(MongoDB.client);
    const { name } = req.query;

    if (name) {
      documents = await productService.findByName(name);
    } else {
      documents = await productService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the product")
    );
  }
  return res.send(documents);
};

// Find a single product with an id
exports.findOne = async (req, res, next) => {
  try {
    const productService = new ProductService(MongoDB.client);
    const document = await productService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving product with id=${req.params.id}`)
    );
  }
};

// Update a product by the in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0 && !(req.file)) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const productService = new ProductService(MongoDB.client);
    const product = await productService.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, "Product does not exist"));
    }
    const fileData = req.file;
    if (fileData) {
      cloudinary.uploader.destroy(product.image.image_name);
      const document = await productService.update(req.params.id, { ...req.body, path: fileData.path, filename: fileData.filename });
      if (!document) {
        return next(new ApiError(404, "Product not found"));
      }
    } else {
      console.log(req.body)
      const document = await productService.update(req.params.id, req.body);
      if (!document) {
        return next(new ApiError(404, "Product not found"));
      }
    }
    return res.send({ message: "Product was updated successfully" });
  } catch (error) {
    console.log(error)
    return next(
      new ApiError(500, `Error updating product with id=${req.params.id}`)
    );
  }
};


// Delete a product with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const productService = new ProductService(MongoDB.client);
    const product = await productService.findById(req.params.id);
    cloudinary.uploader.destroy(product.image.image_name)
    const document = await productService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.send({ message: "Product was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete product with id=${req.params.id}`)
    );
  }
};