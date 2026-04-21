const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const transportBookingSchema = mongoose.Schema({
    transport:       { type: ObjectId, ref: "transport", required: true },
    farmer:          { type: ObjectId, ref: "user",      required: true },
    farmerName:      { type: String,   required: true },
    farmerContact:   { type: String,   required: true },
    pickupDate:      { type: Date,     required: true },
    pickupLocation:  { type: String,   required: true },
    dropLocation:    { type: String,   required: true },
    cropName:        { type: String,   required: true },
    estimatedWeight: { type: String,   required: true },
    notes:           { type: String,   default: "" },
    status:          { type: String,   enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    distance:        { type: Number,   default: 0 }, // km entered by farmer
    // Payment
    paymentStatus:   { type: String,   enum: ["pending", "paid"], default: "pending" },
    totalAmount:     { type: Number,   default: 0 },
    paidAt:          { type: Date,     default: null },
}, { timestamps: true });

module.exports = mongoose.model("transportBooking", transportBookingSchema);
