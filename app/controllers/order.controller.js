const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const OrderService = require("../services/order.service");

// Create and Save a new Order
exports.create = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const document = await orderService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the order")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const document = await orderService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Contact not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving contact with id=${req.params.id}`)
    );
  }
};
// Retrieve all orders of a order from the database
exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const orderService = new OrderService(MongoDB.client);
    const { phone, name } = req.query;

    if (phone) {
      documents = await orderService.findByPhone(phone);
    } else if (name) {
      documents = await orderService.findByName(name);
    }
    else {
      documents = await orderService.findAll();
      // documents = await orderService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving the order")
    );
  }
  return res.send(documents);
};

// Update a order by the in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const document = {};
    const orderService = new OrderService(MongoDB.client);
    document = await orderService.update(req.params.id, req.body);

    if (!document) {
      return next(new ApiError(404, "Order not found"));
    }
    return res.send({ message: "Order was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating order with id=${req.params.id}`)
    );
  }
};

// Delete a order with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const document = await orderService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Order not found"));
    }
    return res.send({ message: "Order was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete order with id=${req.params.id}`)
    );
  }
};

// Delete all orders from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const deletedCount = await orderService.deleteAll();
    return res.send({
      message: `${deletedCount} orders were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error while deleting orders")
    );
  }
};