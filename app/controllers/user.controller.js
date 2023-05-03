const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");
const jwt = require("jsonwebtoken");
const config = require("../config");

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const userService = new UserService(MongoDB.client);
        const { name, phone } = req.query;
        if (name) {
            documents = await userService.findByName(name);
        } else if (phone) {
            documents = await userService.findByPhone(phone);
        } else {
            documents = await userService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving users.")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found."));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving user with id=${req.params.id}`)
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0 && !(req.file)) {
        return next(ApiError(400, "Data to update can not be empty."));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const findUser = await userService.findById(req.params.id);
        if (!findUser) {
            return next(new ApiError(404, "User does not exist."));
        }
        const fileData = req.file;
        if (fileData) {
            cloudinary.uploader.destroy(findUser.avatar.avatar_name);
            await userService.update(req.params.id, {
                ...req.body, path: fileData.path, filename: fileData.filename
            });
        } else {
            await userService.update(req.params.id, req.body);
        }
        return res.send({ message: "User was update successfully." });
    } catch (error) {
        return next(
            new ApiError(500, `Error update user with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found."));
        }
        return res.send({ message: "User was deleted successfully." });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete user with id=${req.param.id}`)
        );
    }
};

// Authorization
exports.signup = async (req, res, next) => {
    if (!req.body?.account.username) {
        return next(new ApiError(400, "Username can not be empty."));
    } else if (!req.body?.account.password) {
        return next(new ApiError(400, "Password can not be empty."));
    }
    try {
        const userService = new UserService(MongoDB.client);
        const findUser = await userService.findUser(req.body);
        if (findUser) {
            return next(new ApiError(400, "Username already exists in the database."));
        } else {
            const document = await userService.signup(req.body);
            return res.send(document);
        }
    } catch (error) {
        console.log(error)
        return next(
            new ApiError(500, "An error occurred while creating the user.")
        );
    }
}

exports.login = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findUsername(req.body);
        if (!user) return next(new ApiError(400, "Wrong username."));
        const validPassword = await userService.validPassword(req.body.password, user.account.password)
        if (!validPassword) return next(new ApiError(400, "Wrong password."));
        if (user && validPassword) {
            const accessToken = await userService.login(user, "2h");
            const refreshToken = await userService.login(user, "1d");
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            return res.send({
                // userid: user._id,
                AccessToken: accessToken,
                user: user,
                // admin: user.account.admin
            });
        }
    } catch (error) {
        console.log(error)
        return next(
            new ApiError(500, "An error occurred while logging the user.")
        );
    }
}

exports.logOut = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        await userService.logout(req.user.id);
        res.clearCookie("refreshToken");
        res.send({ message: "Successful logout." });
        res.end();
    } catch (error) {
        console.log(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return next(
        new ApiError(401, "You're not authenticated.")
    );
    const userService = new UserService(MongoDB.client);
    jwt.verify(refreshToken, config.JWT_Secret, async (error, user) => {
        if (error) return next(
            new ApiError(402, "Token is not valid.")
        );
        const newAccessToken = await userService.refresh(user, "2h");
        const newRefreshToken = await userService.refresh(user, "1d");
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict",
        });

        return res.send({
            userid: user.id,
            AccessToken: newAccessToken
        });
    })
}