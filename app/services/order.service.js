const { ObjectId } = require("mongodb");
require('dotenv').config()

class OrderService {
  constructor(client) {
    this.Order = client.db().collection("orders");
  }
  extractOrderData(payload) {
    const order = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      motor_name: payload.motor_name,
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
    if (result.value.status == "Đã xác nhận") {
      const nodemailer = require("nodemailer");
      console.log(process.env.EMAIL);
      let transporter = nodemailer.createTransport({
        // config mail server
        service: "Gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });
      let mainOptions = {
        from: "Nhat Truong",
        to: result.value.email,
        subject: "MOTORCYCLE RESPONSE",
        text: "You recieved message from Nhat Truong",
        html:
          "<div style='border: 1px solid black;border-top: 5px solid black; width: fit-content; padding: 10px;' >" +
          "<p style='font-size: 12px'>ĐÃ XÁC NHẬN</p>" +
          "<h6>Xin chào" +
          result.value.name +
          "!</h6><br/><p>Chúng tôi đã xem thông tin đăng ký từ bạn, Chúng tôi sẽ sớm sắp lịch và thông báo cho bạn sau</p>" +
          "</div><p><b>Mọi thắc mắc vui lòng phản hồi về Email này!</b></p>"
      };
      transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log("Message sent: " + info.response);
        }
      });
    }

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