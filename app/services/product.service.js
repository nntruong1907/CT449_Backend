const { ObjectId } = require("mongodb");

class ProductService {
  constructor(client) {
    this.Product = client.db().collection("products");
  }
  extractProductData(payload) {
    const product = {
      _typeid: payload._typeid,
      _brandid: payload._brandid,
      name: payload.name,
      price: (payload.price) ? parseInt(payload.price) : payload.price,
      quantity: (payload.quantity) ? parseInt(payload.quantity) : payload.quantity,
      image: {
        image_name: payload.filename,
        image_path: payload.path,
      },
      details: {
        weight: (payload.weight) ? parseInt(payload.weight) : payload.weight,
        length: (payload.length) ? parseInt(payload.length) : payload.length,
        width: (payload.width) ? parseInt(payload.width) : payload.width,
        height: (payload.height) ? parseInt(payload.height) : payload.height,
        ground_clearance: (payload.ground_clearance) ? parseInt(payload.ground_clearance) : payload.ground_clearance,
        fuel_capacity: (payload.fuel_capacity) ? parseInt(payload.fuel_capacity) : payload.fuel_capacity,
        color: payload.color,
        year: (payload.year) ? parseInt(payload.year) : payload.year,
        engine: payload.engine,
        power: (payload.power) ? parseInt(payload.power) : payload.power,
        speed: (payload.speed) ? parseInt(payload.speed) : payload.speed,
        compression_ratio: payload.compression_ratio,
      },
    };

    // remove undefined fields
    Object.keys(product).forEach(
      (key) => product[key] === undefined && delete product[key]
    );

    Object.keys(product.details).forEach(
      (key) => product.details[key] === undefined && delete product.details[key]
    );

    Object.keys(product.image).forEach(
      (key) => product.image[key] === undefined && delete product.image[key]
    );

    if (Object.keys(product.details).length == 0) { delete product.details }
    if (Object.keys(product.image).length == 0) { delete product.image }

    return product;
  }

  async create(payload) {
    const product = this.extractProductData(payload);
    const result = await this.Product.findOneAndUpdate(
      product,
      {
        $set: {
          date_create: new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          }),
        }
      },
      { returnDocument: "after", upsert: true }
    );

    return result.value;
  }

  async findAll() {
    const cursor = await this.Product.aggregate([
      { $addFields: { "_typeid": { $toObjectId: "$_typeid" } } },
      { $addFields: { "_brandid": { $toObjectId: "$_brandid" } } },
      {
        $lookup: {
          from: "types",
          localField: "_typeid",
          foreignField: "_id",
          as: "type",
        },
      },
      { $unwind: "$type" },
      {
        $lookup: {
          from: "brands",
          localField: "_brandid",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },
    ]);
    return await cursor.toArray();
  }

  async findByName(name) {
    const cursor = await this.Product.aggregate([
      { $match: { name: name } },
      { $addFields: { "_typeid": { $toObjectId: "$_typeid" } } },
      { $addFields: { "_brandid": { $toObjectId: "$_brandid" } } },
      {
        $lookup: {
          from: "types",
          localField: "_typeid",
          foreignField: "_id",
          as: "type"
        }
      },
      { $unwind: "$type" },
      {
        $lookup: {
          from: "brands",
          localField: "_brandid",
          foreignField: "_id",
          as: "brand"
        }
      },
      { $unwind: "$brand" },
    ]);

    return await cursor.toArray();
  }

  async findByNameAndColor(name, color) {
    const cursor = await this.Product.find({
      $and: [
        { name: { $eq: name } },
        { 'details.color': { $eq: color } }
      ]
    });

    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Product.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByProductId(id) {
    const cursor = await this.Product.aggregate([
      { $match: { "_id": ObjectId.isValid(id) ? new ObjectId(id) : null } },
      { $addFields: { "_typeid": { $toObjectId: "$_typeid" } } },
      { $addFields: { "_brandid": { $toObjectId: "$_brandid" } } },
      {
        $lookup: {
          from: "types",
          localField: "_typeid",
          foreignField: "_id",
          as: "type"
        }
      },
      { $unwind: "$type" },
      {
        $lookup: {
          from: "brands",
          localField: "_brandid",
          foreignField: "_id",
          as: "brand"
        }
      },
      { $unwind: "$brand" },
    ]);

    return await cursor.toArray();
  }

  async findByTypeId(typeid) {
    const cursor = await this.Product.aggregate([
      { $match: { _typeid: typeid } },
      { $addFields: { "_typeid": { $toObjectId: "$_typeid" } } },
      { $addFields: { "_brandid": { $toObjectId: "$_brandid" } } },
      {
        $lookup: {
          from: "types",
          localField: "_typeid",
          foreignField: "_id",
          as: "type"
        }
      },
      { $unwind: "$type" },
      {
        $lookup: {
          from: "brands",
          localField: "_brandid",
          foreignField: "_id",
          as: "brand"
        }
      },
      { $unwind: "$brand" },
    ]);

    return await cursor.toArray();
  }

  async findByBrandId(brandid) {
    const cursor = await this.Product.aggregate([
      { $match: { _brandid: brandid } },
      { $addFields: { "_typeid": { $toObjectId: "$_typeid" } } },
      { $addFields: { "_brandid": { $toObjectId: "$_brandid" } } },
      {
        $lookup: {
          from: "types",
          localField: "_typeid",
          foreignField: "_id",
          as: "type"
        }
      },
      { $unwind: "$type" },
      {
        $lookup: {
          from: "brands",
          localField: "_brandid",
          foreignField: "_id",
          as: "brand"
        }
      },
      { $unwind: "$brand" },
    ]);

    return await cursor.toArray();
  }

  async updateQuantity(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    }
    const update = this.extractProductData(payload);
    const result = await this.Product.findOneAndUpdate(
      filter,
      {
        $set: {
          ...update
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    }
    const update = this.extractProductData(payload);
    const result = await this.Product.findOneAndUpdate(
      filter,
      {
        $set: {
          ...update,
          date_update: new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          }),
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  async delete(id) {
    const result = await this.Product.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result.value;
  }

}

module.exports = ProductService;
