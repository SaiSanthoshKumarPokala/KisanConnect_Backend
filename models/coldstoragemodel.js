const mongoose = require("mongoose");

let coldstorageSchema = mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    phonenumber: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    slots: { type: Number, required: true },
    capacityforSlot: { type: Number, required: true },
    costperSlot: { type: Number, required: true },
    costperDay: { type: Number, required: true },
},{timestamps: true});

module.exports = mongoose.model("coldstorage", coldstorageSchema);
