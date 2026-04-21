const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const transportSchema = mongoose.Schema({
    owner:       { type: ObjectId, ref: "user", required: true },
    name:        { type: String,   required: true },
    category:    { type: String,   required: true }, // Truck, Mini Truck, Tempo, Pickup, Reefer
    price:       { type: Number,   required: true }, // per km
    capacity:    { type: String,   required: true }, // e.g. "8 Tonnes"
    route:       { type: String,   required: true }, // coverage/route
    description: { type: String,   required: true },
    image:       { type: String,   default: "" },    // base64 or URL
    status:      { type: String,   enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("transport", transportSchema);
