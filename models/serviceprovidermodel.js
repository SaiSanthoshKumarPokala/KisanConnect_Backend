const mongoose = require("mongoose");

let serviceproviderSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    dateofbirth: {type: Date, required: true},
    phonenumber: {type: Number, required: true},
    address: {type: String, required: true},
    pincode: {type: Number, required: true},
    state: {type: String, required: true},
    imageUrl: {type: String, required: false},
    services: {
        rentals: [],
        transport: [],
        products: []
    }
},{timestamps: true});

module.exports = mongoose.model("serviceprovider", serviceproviderSchema);
