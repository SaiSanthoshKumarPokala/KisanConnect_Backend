const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

let coldstorageSchema = mongoose.Schema({
    owner:    { type: ObjectId, ref: "user", required: true },
    name:     { type: String,  required: true },
    location: { type: String,  required: true },
    capacity: { type: Number,  required: true }, // total capacity in tonnes
    price:    { type: Number,  required: true }, // per day per tonne
    images:   [{ type: String }],               // base64 or ImageKit URLs
    status:   { type: String,  enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("coldstorage", coldstorageSchema);
