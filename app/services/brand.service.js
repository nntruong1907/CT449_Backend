const { ObjectId } = require("mongodb");

class BrandService {
    constructor(client) {
        this.Brand = client.db().collection("brands");
    }
    extractBrandData(payload) {
        const brand = {
            name: payload.name,
        };
        Object.keys(brand).forEach(
            (key) => brand[key] === undefined && delete brand[key]
        );

        return brand;
    }

    async find(filter) {
        const cursor = await this.Brand.find(filter);

        return await cursor.toArray();
    }

    async findByName(name) {
        const cursor = await this.Brand.find({
            // name: { $regex: new RegExp(name), $options: "i" },
            name: { $eq: name },
        });

        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Brand.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
    }

    async create(payload) {
        const brand = this.extractBrandData(payload);
        const result = await this.Brand.findOneAndUpdate(
            brand,
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

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        }
        const update = this.extractBrandData(payload);
        const result = await this.Brand.findOneAndUpdate(
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
        const result = await this.Brand.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })

        return result.value;
    }

}

module.exports = BrandService;