const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const marketplaceOrderSchema = mongoose.Schema({
    buyer: { type: ObjectId, ref: "user", required: true }, // SP
    items: [
        {
            listing:  { type: ObjectId, ref: "marketplaceListing" },
            name:     { type: String,   required: true },
            category: { type: String,   default: "" },
            price:    { type: Number,   required: true },
            quantity: { type: Number,   required: true },
            image:    { type: String,   default: "" },
            owner:    { type: ObjectId, ref: "user" }, // farmer who owns the listing
        }
    ],
    totalAmount: { type: Number, required: true },
    status:      { type: String, enum: ["paid"], default: "paid" },
    paidAt:      { type: Date,   default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("marketplaceOrder", marketplaceOrderSchema);
