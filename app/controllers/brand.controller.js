const BrandService = require("../services/brand.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const ProductService = require("../services/product.service");

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const brandService = new BrandService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await brandService.findByName(name);
        } else {
            documents = await brandService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving the brands.")
        );
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const brandService = new BrandService(MongoDB.client);
        const document = await brandService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Brand not found."));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving brand with id=${req.params.id}`)
        );
    }
};

exports.create = async (req, res, next) => {
    if (!req.body?.name) {
        return next(new ApiError(400, "Name can not be empty."));
    }
    try {
        const brandService = new BrandService(MongoDB.client);
        const findBrandName = await brandService.findByName(req.body.name);
        if (findBrandName.length != 0) {
            return next(new ApiError(400, "Name already exists in the database."));
        }
        const document = await brandService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the brand.")
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty."));
    }
    try {
        const brandService = new BrandService(MongoDB.client);
        const findBrandName = await brandService.findByName(req.body.name);
        if (findBrandName.length != 0) {
            return next(new ApiError(400, "Name already exists in the database."));
        }
        const document = await brandService.update(req.params.id, req.body);
        if (!document) {
            return new (ApiError(404, "Brand not found."));
        }
        return res.send({ message: "Brand was update successfully." });
    } catch (error) {
        return next(
            new ApiError(500, `Error update brand with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const productService = new ProductService(MongoDB.client);
        const brandService = new BrandService(MongoDB.client);
        const findbrandInProduct = await productService.findByBrandId(req.params.id);
        if (findbrandInProduct.length != 0) {
            return next(new ApiError(405, "Brand cannot be deleted."));
        }
        const document = await brandService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Brand not found."));
        }
        return res.send({ message: "Brand was deleted successfully." });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete brand with id=${req.params.id}`)
        );
    }
};
