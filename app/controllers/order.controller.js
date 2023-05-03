const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const OrderService = require("../services/order.service");
const ProductService = require("../services/product.service");
const UserService = require("../services/user.service");

exports.create = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const productService = new ProductService(MongoDB.client);
    const product = await productService.findById(req.body._productid);
    if (product.quantity == 0) {
      return next(
        new ApiError(404, "Sold out.")
      );
    }
    let quantity = parseInt(product.quantity) - 1;
    await productService.updateQuantity(product._id, { quantity: quantity });
    const document = await orderService.create({ ...req.body, _userid: req.user.id });
    return res.send(document);
  } catch (error) {
    console.log(error)
    return next(
      new ApiError(500, "An error occurred while creating the order.")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const document = await orderService.findByOrderId(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Order not found."));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving order with id=${req.params.id}`)
    );
  }
};

exports.findByUserId = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const document = await orderService.findByUserId(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Order not found."));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving order with id=${req.params.id}`)
    );
  }
};


exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const orderService = new OrderService(MongoDB.client);
    const { phone, name, status } = req.query;

    if (phone) {
      documents = await orderService.findByPhone(phone);
    } else if (name) {
      documents = await orderService.findByName(name);
    } else if (status) {
      documents = await orderService.findByStatus(status);
    } else {
      documents = await orderService.findAll();
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the order.")
    );
  }

  return res.send(documents);
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty."));
  }

  try {
    let document = {};
    const orderService = new OrderService(MongoDB.client);
    document = await orderService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Order not found."));
    }

    const productService = new ProductService(MongoDB.client);
    const product = await productService.findById(document._productid);
    if (document.status == "Unconfirmed") {
      let quantity = parseInt(product.quantity) + 1;
      await productService.updateQuantity(product._id, { quantity: quantity });
    }
    return res.send({ message: "Order was updated successfully." });
  } catch (error) {
    console.log(error)
    return next(
      new ApiError(500, `Error updating order with id=${req.params.id}`)
    );
  }
};