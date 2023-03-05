const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");

// Create and Save a new User
exports.create = async (req, res, next) => {
    if (!req.body?.account.username) {
        return next(new ApiError(400, "Username can not be empty"));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findByUsername(req.body);
        if(user){
            return next(new ApiError(400, "Username or email already exists"));
        }
        const document = await userService.create(req.body);
        return res.send(document);

    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the user")
        );
    }
};

// Retrieve all users of a user from the database
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const userService = new UserService(MongoDB.client);
        const { name , address } = req.query;
        
        if (name) {
            documents = await userService.findByName(name);
        } else if (address) {
            documents = await userService.findByAddress(address);
        } else {
            documents = await userService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving users")
        );
    }

    return res.send(documents);
};

// Find a single user with an id
exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "User not found"));
        }

        return res.send(document);

    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving user with id=${req.params.id}`
            )
        );
    }
};

// Update a user by the in the request
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "user not found"));
        }

        return res.send({ message: "User was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating user with id=${req.params.id}`)
        );
    }
};

// Delete a user with the specified id in the request
exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "User not found"));
        }

        return res.send({ message: "User was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete user with id=${req.param.id}`
            )
        );
    }
};
// Log in
exports.login = async (req, res, next) => {
    try {
      const userService = new UserService(MongoDB.client);
      const document = await userService.login(req.body);
      console.log(document);

      if (!document) {
        return next(new ApiError(404, "Username or Password incorrect"));
      }

      return res.send(document);
      
    } catch (error) {
      return next(
        new ApiError(500, `Error retrieving User with id=${req.params.id}`)
      );
    }
  };