const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const rentalBookingSchema = mongoose.Schema({
    rental:          { type: ObjectId, ref: "rental", required: true },
    farmer:          { type: ObjectId, ref: "user",   required: true },
    farmerName:      { type: String,   required: true },
    farmerContact:   { type: String,   required: true },
    startDate:       { type: Date,     required: true },
    endDate:         { type: Date,     required: true },
    expectedHours:   { type: String,   default: "" },
    deliveryAddress: { type: String,   required: true },
    notes:           { type: String,   default: "" },
    status:          { type: String,   enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    // Payment
    paymentStatus:   { type: String,   enum: ["pending", "paid"], default: "pending" },
    totalAmount:     { type: Number,   default: 0 },
    paidAt:          { type: Date,     default: null },
}, { timestamps: true });

module.exports = mongoose.model("rentalBooking", rentalBookingSchema);
