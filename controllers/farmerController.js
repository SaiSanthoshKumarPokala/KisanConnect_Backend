const farmermodel = require("../models/farmermodel");
const rentalmodel = require("../models/rentalmodel");
const userModel = require("../models/userModel");


// Get user data using JWT Token
async function getFarmerData(req, res) {
    try {
        const {farmer} = req;
        res.json({success:true, farmer});
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message: error.message});
    }
}

async function getRentals(req, res) {
    try {
        const rentals = await rentalmodel.find({isAvailable: true});
        res.json({success: true, rentals});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

async function changeRole(req, res) {
    try {
        const { _id } = req.user;
        await userModel.findByIdAndUpdate(_id, { role: "serviceprovider" });
        res.json({ success: true, message: "Role changed successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


async function submitDetails(req, res) {
    try {
        const { _id } = req.user;
        const {email, name, dob, number, address, pincode, states} = req.body;
        await farmermodel.create({_id, email, name, dob, number, address, pincode, states});
        res.json({ success: true, message: "Details updated successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

module.exports = { getFarmerData, getRentals, changeRole, submitDetails };
