const { ObjectId } = require("mongodb");

class ProductService {
  constructor(client) {
    this.Product = client.db().collection("products");
  }
  extractProductData(payload) {
    const product = {
      name: payload.name,
      type: payload.type,
      brand: payload.type_brand,
      // price: parseInt(payload.price),
      price: payload.price,
      image: {
        image_name: payload.filename,
        image_path: payload.path,
      },
      date_create_product: new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
      // quantity: parseInt(payload.quantity),
      quantity: payload.quantity,
      details: {
        // weight: parseInt(payload.weight),
        // length: parseInt(payload.length),
        // width: parseInt(payload.width),
        // height: parseInt(payload.height),
        // ground_clearance: parseInt(payload.ground_clearance),
        // fuel_capacity: parseInt(payload.fuel_capacity),
        weight: payload.weight,
        length: payload.length,
        width: payload.width,
        height: payload.height,
        ground_clearance: payload.ground_clearance,
        fuel_capacity: payload.fuel_capacity,
        color: payload.color,
        // year: parseInt(payload.year),
        year: payload.year,
        engine: payload.engine,
        // power: parseFloat(payload.power),
        // speed: parseInt(payload.speed),
        power: payload.power,
        speed: payload.speed,
        compression_ratio: payload.compression_ratio,
      },
      changed: true,
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

  // async create(payload) {
  //   const product = this.extractProductData(payload);
  //   const result = await this.Product.insertOne(
  //     product
  //   );
  //   return result.value;
  // }

  async create(payload) {
    const product = this.extractProductData(payload);
    const result = await this.Product.findOneAndUpdate(
      product,
      { $set: { changed: false } },
      { returnDocument: "after", upsert: true }
    );
    return result.value;
  }

  async find(filter) {
    const cursor = await this.Product.find(filter);
    return await cursor.toArray();
  }

  async findByName(product) {
    return await this.Product.findOne({
      $or: [
        { name: { $regex: new RegExp(product.name) } },
      ]
    });
  }

  async findById(id) {
    return await this.Product.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    }
    const update = this.extractProductData(payload);
    console.log(update);
    const result = await this.Product.findOneAndUpdate(
      filter,
      { $set: update },
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
