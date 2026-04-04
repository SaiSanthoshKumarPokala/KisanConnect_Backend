const mongoose = require("mongoose");


let userSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["farmer", "serviceprovider"], default:"farmer" },
},{timestamps: true});

module.exports = mongoose.model("user", userSchema);
