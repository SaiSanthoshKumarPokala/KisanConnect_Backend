const rentalmodel = require("../models/rentalmodel");
const userModel = require("../models/userModel");
const upload = require("../middlewares/multer");
const fs = require("fs");
const ImageKit = require("@imagekit/nodejs");
const rentalBookingModel = require("../models/rentalBookingModel");
const farmermodel = require("../models/farmermodel");
const serviceprovidermodel = require("../models/serviceprovidermodel");

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function changeRole(req, res) {
    try {
        const { _id } = req.user;
        await userModel.findByIdAndUpdate(_id, { role: "farmer" });
        res.json({ success: true, message: "Role changed successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function submitDetails(req, res) {
    try {
        const { _id } = req.user;
        const { email, name, dateofbirth, phonenumber, address, pincode, state } = req.body;
        await serviceprovidermodel.create({
            _id, email, name, dateofbirth
            , phonenumber, address, pincode, state
        });
        res.json({ success: true, message: "Details updated successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function addRental(req, res) {
    try {
        const { _id } = req.user;
        let rental = JSON.parse(req.body.rentalData);
        const imageFile = req.file;
        const response = await client.files.upload({
            file: fs.createReadStream(imageFile.path), fileName: imageFile.filename, folder: '/kisanconnect/rentals'
        });
        // console.log(imageFile);
        const transformedUrl = client.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: `/kisanconnect/rentals/${imageFile.originalname}`,
            transformation: [
                {
                    width: 300,
                    crop: 'maintain_ratio',
                    quality: 'auto',
                    format: 'webp',
                },
            ],
        });

        const image = transformedUrl;
        await rentalmodel.create({ ...rental, owner: _id, image });
        res.json({ success: true, message: "Rental added successfully" });
    } catch (error) {
        // const imageFile = req.file;
        // console.log(imageFile);
        res.json({ success: false, message: error.message });
    }
}

async function listRentals(req, res) {
    try {
        const { _id } = req.user;
        const rentals = await rentalmodel.find({ owner: _id });
        res.json({ success: true, rentals });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function toggleRentalAvailability(req, res) {
    try {
        const { _id } = req.user;
        const { rentalId } = req.body;
        const rental = await rentalmodel.findById(rentalId);

        if (rental.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }
        rental.isAvailable = !rental.isAvailable;
        await rental.save();
        res.json({ success: true, message: "Availability updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function deleteRental(req, res) {
    try {
        const { _id } = req.user;
        const { rentalId } = req.body;
        const rental = await rentalmodel.findById(rentalId);

        if (rental.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" })
        }
        rental.owner = null;
        rental.isAvailable = false;
        await rental.save();
        res.json({ success: true, message: "Availability updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

async function editRentals(req, res) {
    try {

    } catch (error) {

    }
}

async function getserviceproviderData(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "serviceprovider") {
            return res.json({ success: false, message: "Unauthorized" })
        };
        const rentals = await rentalmodel.find({ owner: _id });
        const bookings = await rentalBookingModel.find({ owner: _id }).populate("rental").sort({ createdAt: -1 });


        res.json({ success: true, rentals });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

module.exports = { changeRole, addRental, listRentals, toggleRentalAvailability, editRentals, getserviceproviderData, deleteRental, submitDetails };