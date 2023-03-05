const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class UserService {
    constructor(client) {
        this.User = client.db().collection("users");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractUserData(payload) {
        const user = {
            name: payload.name,
            phone: payload.phone,
            address: payload.address,
            email: payload.email,
            avatar: payload.avatar,
            account: {
                username: payload.account.username,
                password: payload.account.password,
                permission: payload.account.permission ?? 1,
              },
        };

        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        return user;
    }

    async create(payload) {
        const user = this.extractUserData(payload);
        // console.log(user);
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        const passwordHash = await bcrypt.hash(user.account.password, salt);
        const result = await this.User.findOneAndUpdate(
            user,
            { $set: { 'account.password': passwordHash} },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.User.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findByUsername(user) {
        return await this.User.findOne({
            $or:[
                {'account.username': { $regex: new RegExp(user.account.username) }},
                {email:{ $regex: new RegExp(user.email) }},
            ]
                
        });
    }

    async findById(id) {
        return await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractUserData(payload);
        const result = await this.User.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.User.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.user.deleteMany({});
        return result.deletedCount;
    }
    // Login 
    async login(payload){
        const user = await this.User.findOne({ "account.username": payload.username });
        if (user) {
          // check user password with hashed password stored in the database
            const validPassword = await bcrypt.compare(payload.password, user.account.password);
            if (validPassword) {
                return {userid:user._id, name: user.name}
            } else {
                return false;
            }
        }
    }
}

module.exports = UserService;