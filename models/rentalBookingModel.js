const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

let rentalBookingSchema = mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: ObjectId, ref: "User" },
    user: { type: ObjectId, ref: "User" },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    farmLocation: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, required: true, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    driverNeeded: { type: Boolean, required: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model("rentalBooking", rentalBookingSchema);
