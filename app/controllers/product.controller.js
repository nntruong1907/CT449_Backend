const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const ProductService = require("../services/product.service");
const cloudinary = require('cloudinary').v2;
const OrderService = require("../services/order.service");

exports.create = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "Image can not be empty."));
  }
  try {
    const fileData = req.file;
    const productService = new ProductService(MongoDB.client);
    if (!req.body.quantity) {
      cloudinary.uploader.destroy(fileData.filename);
      return next(new ApiError(400, "Quantity can not be empty."));
    }
    const findNameAndColor = await productService.findByNameAndColor(req.body.name, req.body.color);
    if (findNameAndColor.length != 0) {
      cloudinary.uploader.destroy(fileData.filename);
      return next(new ApiError(400, "Product already exists."));
    }
    const document = await productService.create({ ...req.body, path: fileData?.path, filename: fileData?.filename });
    return res.send(document);

  } catch (error) {
    console.log(error);
    cloudinary.uploader.destroy(req.file.filename);
    return next(
      new ApiError(500, "An error occurred while creating the product.")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const productService = new ProductService(MongoDB.client);
    const { name, typeid, brandid } = req.query;

    if (name) {
      documents = await productService.findByName(name);
    } else if (typeid) {
      documents = await productService.findByTypeId(typeid);
    } else if (brandid) {
      documents = await productService.findByBrandId(brandid);
    } else {
      documents = await productService.findAll();
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the product.")
    );
  }
  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const productService = new ProductService(MongoDB.client);
    const document = await productService.findByProductId(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Product not found."));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving product with id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0 && !(req.file)) {
    return next(new ApiError(400, "Data to update cannot be empty."));
  }

  try {
    const productService = new ProductService(MongoDB.client);
    const product = await productService.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, "Product does not exist."));
    }
    const fileData = req.file;
    if (fileData) {
      cloudinary.uploader.destroy(product.image.image_name);
      await productService.update(req.params.id, { ...req.body, path: fileData.path, filename: fileData.filename });
    } else {
      await productService.update(req.params.id, req.body);
    }
    return res.send({ message: "Product was updated successfully." });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating product with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const productService = new ProductService(MongoDB.client);
    const findProductInOrder = await orderService.findByProductId(req.params.id);
    if (findProductInOrder.length != 0) {
      return next(new ApiError(400, "Product cannot be deleted."));
    }
    const product = await productService.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, "Product does not exist."));
    }
    cloudinary.uploader.destroy(product.image.image_name);
    const document = await productService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Product not found."));
    }
    return res.send({ message: "Product was deleted successfully." });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete product with id=${req.params.id}`)
    );
  }
};