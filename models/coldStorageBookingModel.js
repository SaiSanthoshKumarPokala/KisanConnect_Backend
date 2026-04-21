const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

let coldStorageBookingSchema = mongoose.Schema({
    storage:        { type: ObjectId, ref: "coldstorage", required: true },
    farmer:         { type: ObjectId, ref: "user",        required: true },
    farmerName:     { type: String,   required: true },
    farmerLocation: { type: String,   required: true },
    farmerContact:  { type: String,   required: true },
    cropName:       { type: String,   required: true },
    startDate:      { type: Date,     required: true },
    endDate:        { type: Date,     required: true },
    quantity:       { type: Number,   required: true },
    status:         { type: String,   enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    // Payment
    paymentStatus:  { type: String,   enum: ["pending", "paid"], default: "pending" },
    totalAmount:    { type: Number,   default: 0 },
    paidAt:         { type: Date,     default: null },
}, { timestamps: true });

module.exports = mongoose.model("coldStorageBooking", coldStorageBookingSchema);
