const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const rentalSchema = mongoose.Schema({
    owner:       { type: ObjectId, ref: "user", required: true },
    name:        { type: String,   required: true },
    category:    { type: String,   required: true }, // Harvester, Tractor, Seeder, Rotavator
    price:       { type: Number,   required: true }, // per day
    location:    { type: String,   required: true },
    description: { type: String,   required: true },
    image:       { type: String,   default: "" },
    status:      { type: String,   enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("rental", rentalSchema);
