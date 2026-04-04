const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET);
}

// Register User
async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.json({ success: false, message: "Fill all the fields." });
        }

        if (password.length < 6) {
            return res.json({ success: false, message: "Password should be minimum 6 characters." });
        }

        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await userModel.create({ username, email, password: hashedPassword });

        const token = generateToken(user._id.toString());
        res.json({ success: true, token });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Login user
async function LoginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials." });
        }

        const token = generateToken(user._id.toString());
        res.json({ success: true, token });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

async function getUserData(req, res) {
    try {
        const { _id } = req.user;
        const user = await userModel.findById(_id);
        console.log(user);
        res.json({ success: true, user });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

async function selectRole(req, res) {
    try {
        const { _id } = req.user;
        const {role}  = req.body;
        await userModel.findByIdAndUpdate(_id, { role: role });
        res.json({ success: true, message: "Role selected successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

module.exports = { registerUser, LoginUser, getUserData, selectRole };