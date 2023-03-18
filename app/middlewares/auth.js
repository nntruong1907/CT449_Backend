const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../api-error");

const MongoDB = require("../utils/mongodb.util");
const OrderService = require("../services/order.service");

exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = await req.header('Authorization');
        if(!authHeader) return next(new ApiError(400, "You're not authoticated"));
        const baerer = await authHeader.split(' ')[0];
        const token = await authHeader.split(' ')[1];

        if( token && baerer == "Bearer"){
            jwt.verify(token, config.JWT_Secret, (error, user) => {
                if (error) return next(new ApiError(400, "Token is not valid"));
                req.user = user;
                next();
            });
        }else{
            return next(new ApiError(400, "You're not authoticated"));
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while logging in the user")
        );
    }
}

exports.verifyTokenAdmin = async (req, res, next) => {
    if (req.user.id == req.params.id || req.user.admin) {
        next();
    } else {
        return next(
            new ApiError(400, "You are not allowed to make other changes")
        );
    }
}

exports.verifyTokenAdminOrder = async (req, res, next) => {
    const orderService = new OrderService(MongoDB.client);
    const order = await orderService.findById(req.params.id);
    if (req.user.id == order._uid || req.user.admin) {
        next();
    } else {
        return next(
            new ApiError(400, "You are not allowed to make other changes")
        );
    }
}