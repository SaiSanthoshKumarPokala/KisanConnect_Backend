const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

let contractSchema = mongoose.Schema({
    owner:        { type: ObjectId, ref: "user", required: true },
    company:      { type: String, required: true },
    companyType:  { type: String, required: true },
    crop:         { type: String, required: true },
    variety:      { type: String, default: "" },
    region:       { type: String, required: true },
    season:       { type: String, required: true },
    minLand:      { type: Number, required: true },
    totalLand:    { type: Number, required: true },
    farmersNeeded:{ type: Number, required: true },
    duration:     { type: String, required: true },
    priceMin:     { type: Number, required: true },
    priceMax:     { type: Number, required: true },
    qualityStd:   { type: String, default: "" },
    inputSupport: { type: Boolean, default: false },
    paymentTerms: { type: String, required: true },
    notes:        { type: String, default: "" },
    status:       { type: String, enum: ["Active", "Closed"], default: "Active" },
}, { timestamps: true });

module.exports = mongoose.model("contract", contractSchema);
