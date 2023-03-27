const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

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
            account: {
                username: payload.account.username,
                password: payload.account.password,
                admin: payload.admin,
            },
            avatar: {
                avatar_path: payload.path,
                avatar_name: payload.filename
            },
        };

        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        Object.keys(user.account).forEach(
            (key) => user.account[key] === undefined && delete user.account[key]
        );
        if (Object.keys(user.account).length == 0) { delete user.account }

        Object.keys(user.avatar).forEach(
            (key) => user.avatar[key] === undefined && delete user.avatar[key]
        );
        if (Object.keys(user.avatar).length == 0) { delete user.avatar }

        return user;
    }

    async find(filter) {
        const cursor = await this.User.find(filter);

        return await cursor.toArray();
    }

    async findByName(name) {
        const cursor = await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });

        return await cursor.toArray();
    }

    async findByPhone(phone) {
        const cursor = await this.find({
            phone: { $regex: new RegExp(phone), $options: "i" },
        });

        return await cursor.toArray();
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

    async logout(id) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        await this.User.findOneAndUpdate(
            filter,
            { $set: { isLogIn: false } },
            { returnDocument: "after" }
        );
    }

    // Register
    async register(payload) {
        const user = this.extractUserData(payload);
        const salt = bcrypt.genSaltSync(10);
        const passwordHashed = bcrypt.hashSync(user.account.password, salt);
        const avatarDefault = [
            'https://res.cloudinary.com/dvbzja2gq/image/upload/v1678609679/motorcycle/avt/avt6_jwdkr5.png'
            , 'https://res.cloudinary.com/dvbzja2gq/image/upload/v1678609679/motorcycle/avt/avt4_m60guj.png'
            , 'https://res.cloudinary.com/dvbzja2gq/image/upload/v1678609678/motorcycle/avt/avt5_wr6sey.png'
            , 'https://res.cloudinary.com/dvbzja2gq/image/upload/v1678609678/motorcycle/avt/avt3_nglwui.png'
        ]
        const result = await this.User.findOneAndUpdate(
            user,
            {
                $set: {
                    'account.admin': false,
                    'account.password': passwordHashed,
                    avatar: {
                        avatar_path: avatarDefault[Math.floor(Math.random() * 4)],
                    }
                }
            },
            { returnDocument: "after", upsert: true }
        );

        return result.value;
    }

    // Login 
    async login(payload, time) {
        const filter = {
            _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
        };
        await this.User.findOneAndUpdate(
            filter,
            { $set: { isLogIn: true } },
            { returnDocument: "after" }
        );
        return jwt.sign({
            iss: 'Nguyen Nhat Truong',
            id: payload._id,
            admin: payload.account.admin,
        }, config.JWT_Secret, {  // secretOrPublicKey mã bí mặt (NodejsApiAuthentication)
            expiresIn: time,    // Ngày hết hạn Token 
        })
    }

    async validPassword(validpassword, password) {
        return await bcrypt.compare(
            validpassword,
            password,
        );
    }

    async refresh(payload, time) {
        return jwt.sign({
            iss: 'Nguyen Nhat Truong',
            id: payload.id,
            admin: payload.account.admin,
        }, config.JWT_Secret, {
            expiresIn: time,
        })
    }

    async findUser(payload) {
        return await this.User.findOne({ 'account.username': payload.account.username });
    }

    async findUsername(payload) {
        return await this.User.findOne({ 'account.username': payload.username });
    }

}

module.exports = UserService;