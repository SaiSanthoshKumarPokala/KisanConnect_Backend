const mongoose = require("mongoose");

let transportSchema = mongoose.Schema({
    id: {type: String, required: true},
    imageUrl: {type: String, required: true},
    vehicleName: {type: String, required: true},
    driver: {type: String, required: true},
    driverImage: {type: String, required: true},
    owner: {type: String, required: true},
    price: {type: Number, required: true},
    rating: {type: Number, default: 0},
    capacity: {type: Number, required: true},
    vehicleNumber: {type: String, required: true},
    pickup: {type: String, required: true},
    drop: {type: String, required: true},
    location: {type: String, required: true},
    type: {type: String, required: true}, // National or regional
    permit: {type: String, required: true}, //All India or respective states
},{timestamps: true});

module.exports = mongoose.model("transport", transportSchema);
