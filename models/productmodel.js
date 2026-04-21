const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = mongoose.Schema({
    owner:       { type: ObjectId, ref: "user", required: true },
    name:        { type: String,   required: true },
    brand:       { type: String,   required: true },
    category:    { type: String,   required: true },
    price:       { type: Number,   required: true }, // price per kg
    stock:       { type: Number,   required: true }, // quantity in kg
    description: { type: String,   required: true },
    image:       { type: String,   default: "" },
    status:      { type: String,   enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("product", productSchema);
