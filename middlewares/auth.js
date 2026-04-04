const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function protect(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.json({ success: false, message: "Not authorized, token missing" });
    }
    try {
        const userId = jwt.decode(token, process.env.JWT_SECRET);

        if (!userId) {
            return res.json({ success: false, message: "Not authorized, Invalid user" });
        }
        req.user = await userModel.findById(userId).select("-password");
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

module.exports = protect;