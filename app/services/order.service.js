const { ObjectId } = require("mongodb");
require('dotenv').config()

class OrderService {
  constructor(client) {
    this.Order = client.db().collection("orders");
  }
  extractOrderData(payload) {
    const order = {
      _userid: payload._userid,
      _productid: payload._productid,
      receiver: {
        name: payload.receiver.name,
        phone: payload.receiver.phone,
        email: payload.receiver.email,
        address: payload.receiver.address,
      },
      payment: payload.payment,

      status: payload.status
    };

    // remove undefined fields
    Object.keys(order).forEach(
      (key) => order[key] === undefined && delete order[key]
    );
    Object.keys(order.receiver).forEach(
      (key) => order.receiver[key] === undefined && delete order.receiver[key]
    );
    if (Object.keys(order.receiver).length == 0) { delete order.receiver };

    return order;
  }

  async findByName(name) {
    const cursor = await this.Order.aggregate([
      { $match: { "receiver.name": name } },
      { $addFields: { "_productid": { $toObjectId: "$_productid" } } },
      {
        $lookup: {
          from: "products",
          localField: "_productid",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
    ]);

    return await cursor.toArray();
  }

  async findByPhone(phone) {
    const cursor = await this.Order.aggregate([
      { $match: { "receiver.phone": phone } },
      { $addFields: { "_productid": { $toObjectId: "$_productid" } } },
      {
        $lookup: {
          from: "products",
          localField: "_productid",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
    ]);

    return await cursor.toArray();
  }

  async findByStatus(status) {
    const cursor = await this.Order.aggregate([
      { $match: { status: status } },
      { $addFields: { "_productid": { $toObjectId: "$_productid" } } },
      {
        $lookup: {
          from: "products",
          localField: "_productid",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
    ]);

    return await cursor.toArray();
  }

  async findAll() {
    const cursor = await this.Order.aggregate([
      { $addFields: { "_productid": { $toObjectId: "$_productid" } } },
      {
        $lookup: {
          from: "products",
          localField: "_productid",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Order.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByOrderId(id) {
    const cursor = await this.Order.aggregate([
      { $match: { "_id": ObjectId.isValid(id) ? new ObjectId(id) : null } },
      { $addFields: { "_productid": { $toObjectId: "$_productid" } } },
      {
        $lookup: {
          from: "products",
          localField: "_productid",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
    ]);

    return await cursor.toArray();
  }

  async findByProductId(productid) {
    const cursor = await this.Order.find({
      _productid: productid ? productid.toString() : null,
    });

    return await cursor.toArray();
  }

  async create(payload) {
    const order = this.extractOrderData(payload);
    const result = await this.Order.findOneAndUpdate(
      order,
      {
        $set: {
          status: 'Chưa xác nhận',
          date_oder: new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          }),
        }
      },
      { returnDocumnet: "after", upsert: true }
    );

    return result.value;
  }

  async update(id, payload) {
    console.log(payload)
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const result = await this.Order.findOneAndUpdate(
      filter,
      {
        $set: {
          ...payload,
          date_update: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", })
        }
      },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    const result = await this.Order.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result.value;
  }

  async deleteAll() {
    const result = await this.Order.deleteMany({});

    return result.deletedCount;
  }

}

module.exports = OrderService;