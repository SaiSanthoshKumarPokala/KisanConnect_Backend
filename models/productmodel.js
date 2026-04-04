const mongoose = require("mongoose");

let productSchema = mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    seller: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
},{timestamps: true});

module.exports = mongoose.model("product", productSchema);
