const mongoose = require("mongoose");


let farmerSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    dateofbirth: { type: Date, required: true },
    phonenumber: { type: Number, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    state: { type: String, required: true },
    cart: { type: [] },
    orders: { type: [] },
    imageUrl: { type: String, required: false },
},{timestamps: true});

module.exports = mongoose.model("farmer", farmerSchema);
