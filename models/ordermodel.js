const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const orderSchema = mongoose.Schema({
    farmer:            { type: ObjectId, ref: "user", required: true },
    items:             { type: Array,    required: true },
    totalAmount:       { type: Number,   required: true },
    // Razorpay
    razorpayOrderId:   { type: String,   default: "" },
    razorpayPaymentId: { type: String,   default: "" },
    payment:           { type: Boolean,  default: false },
    status:            { type: String,   enum: ["pending", "paid"], default: "pending" },
    paidAt:            { type: Date,     default: null },
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);
