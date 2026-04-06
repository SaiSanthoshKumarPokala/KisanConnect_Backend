const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

let contractApplicationSchema = mongoose.Schema({
    contract:     { type: ObjectId, ref: "contract", required: true },
    farmer:       { type: ObjectId, ref: "user", required: true },
    name:         { type: String, required: true },
    phone:        { type: String, required: true },
    location:     { type: String, required: true },
    land:         { type: Number, required: true },
    experience:   { type: String, required: true },
    currentCrop:  { type: String, default: "" },
    message:      { type: String, default: "" },
    status:       { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("contractApplication", contractApplicationSchema);
