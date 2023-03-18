const { ObjectId } = require("mongodb");
require('dotenv').config()

class OrderService {
  constructor(client) {
    this.Order = client.db().collection("orders");
  }
  extractOrderData(payload) {
    const order = {
      _id_user: payload._id_user,
      _id_motor: payload._id_motor,
      quantity_motor: payload.quantity_motor,
      phone_order: payload.phone_order,
      address_order: payload.address_order,
      time_oder: new Date().toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    };

    // remove undefined fields
    Object.keys(order).forEach(
      (key) => order[key] === undefined && delete order[key]
    );
    return order;
  }

  // async create(payload) {
  //   const order = this.extractOrderData(payload);
  //   const result = await this.Order.insertOne(order);

  //   return result;
  // }

  async create(payload) {
    const order = this.extractOrderData(payload);
    const result = await this.Order.findOneAndUpdate(
      order,
      { $set: { status: 'Chưa xác nhận' } },
      { returnDocumnet: "after", upsert: true }
    );
    return result.value;
  }

  async findAll() {
    const cursor = await this.Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "motor_name",
          foreignField: "name",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);
    return await cursor.toArray();
  }

  async findByPhone(phone) {
    return await this.Order.aggregate([
      {
        $lookup: {
          from: "products",
          let: { motor_name: "$motor_name", phone: "$phone" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$name", "$$motor_name"] },
                    { $eq: ["$$phone", phone] },
                  ],
                },
              },
            },
          ],
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]).toArray();

    // find({
    //   phone: { $regex: new RegExp(phone), $options: "i" },
    // }).toArray();
  }

  async findByName(name) {
    return await this.Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "motor_name",
          foreignField: "name",
          as: "product",
        },
      },
      { $match: { name: name } },
      { $unwind: "$product" },
    ]).toArray();
  }

  async findById(name) {
    return await this.Order.findOne({
      name: name,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const result = await this.Order.findOneAndUpdate(
      filter,
      {
        $set: {
          ...payload,
          time_update: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", })
        }
      },
      { returnDocument: "after" }
    );
    return result;
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