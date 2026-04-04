const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

let rentalSchema = mongoose.Schema({
    rental: { type: String, required: true },
    owner: { type: ObjectId, ref: "User" },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    image: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, required: true, default: true }
},{timestamps: true});

module.exports = mongoose.model("rental", rentalSchema);
