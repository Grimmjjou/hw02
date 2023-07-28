const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { User } = require('../models/user');
const { HttpError } = require('../helpers');
const { schemas } = require("../models/user");

const { SECRET_KEY } = process.env;


const register = async (req, res, next) => {
    try {
        const { error } = schemas.registerSchemas.validate(req.body);

        if (error) {
            throw HttpError(400, "Missing required name field");
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            throw HttpError(409, "Email in use");
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ ...req.body, password: hashPassword });

        res.status(201).json({ email: newUser.email, subscription: "starter" });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { error } = schemas.loginSchemas.validate(req.body);
        if (error) {
            throw HttpError(400, "Missing required name field");
        }
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw HttpError(401, "Email or password is wrong");
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            throw HttpError(401, "Email or password is wrong");
        }

        const payload = { id: user._id };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
        await User.findByIdAndUpdate(user._id, { token });

        res.json({ token, user: { email, subscription: user.subscription } });
    } catch (error) {
        next(error);
    }
};

const getCurrent = async (req, res, next) => {

    const { email, subscription } = req.user;
    res.json({ email, subscription })
}

const logOut = async (req, res, next) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { token: "" })
        res.json({ message: "Logout success" })
    } catch (error) {
        next(error)
    }
}

const updateSubscriptionUser = async (req, res, next) => {
    try {
        const { error } = schemas.updateSubscriptionSchema.validate(req.body);
        if (error) {
            throw HttpError(400, "Missing field subscription");
        }

        const { subscription } = req.body;
        if (!["starter", "pro", "business"].includes(subscription)) {
            throw HttpError(400, "Missing field subscription");
        }

        const { id } = req.params;
        const result = await User.findByIdAndUpdate(
            id,
            { subscription },
            { new: true }
        );
        if (!result) {
            throw HttpError(404, "Not found");
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
};
module.exports = {
    register,
    login,
    getCurrent,
    logOut,
    updateSubscriptionUser,
}