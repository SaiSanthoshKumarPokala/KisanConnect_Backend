const rentalBookingModel = require("../models/rentalBookingModel");
const rentalmodel = require("../models/rentalmodel");


async function checkAvailability(rental, startDate, endDate) {

    const bookings = await rentalBookingModel.find({
        rental,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
    })
    return bookings.length === 0;
}

async function checkRentalAvailability(req, res) {
    try {
        const { location, startDate, endDate } = req.body;

        const rentals = await rentalmodel.find({ location, isAvailable: true });

        const availableRentalPromises = rentals.map(async (rental) => {
            const isAvailable = await checkAvailability(rental._id, startDate, endDate);
            return { ...rental, isAvailable: isAvailable };
        })
        let availableRentals = await Promise.all(availableRentalPromises);
        availableRentals = availableRentals.filter(rental => rental.isAvailable === true);

        res.json({
            success: true,
            availableRentals
        });

    } catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        });
    }
}

async function createBooking(req, res) {
    try {
        const { _id } = req.user;
        const { rental, startDate, endDate } = req.body;

        const isAvailable = await checkAvailability(rental, startDate, endDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Rental is not available" })
        }

        const rentalData = await rentalmodel.findById(car);

        const start = new Date(startDate);
        const end = new Date(endDate);
        const noOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        const price = rentalData.price * noOfDays;

        await rentalBookingModel.create({rental, owner: rentalData.owner, user: _id, startDate, endDate, price});
        res.json({
            success: true,
            message: "Booking successful"
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


async function getUserBookings(req, res) {
    try {
        const { _id } = req.user;
        const bookings = await rentalBookingModel.find({user: _id}).populate("rental").sort({createdAt: -1});
        res.json({
            success: true, bookings
        })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


async function getserviceproviderBookings(req, res) {
    try {
        if(req.user.role !== "serviceprovider"){
            return res.json({success:false, message:"Unauthorized"});
        }
        const bookings = await rentalBookingModel.find({owner:req.user._id}).populate("rental user").select("-user.password").sort({createdAt: -1});
        res.json({
            success: true, bookings
        })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Incomplete - refer rental video from greatstack at 7:02:00 if required
// async function updateBookingStatus(req, res) {
//     try {
//         if(req.user.role !== "serviceprovider"){
//             return res.json({success:false, message:"Unauthorized"});
//         }
//         const bookings = await rentalBookingModel.find({owner:req.user._id}).populate("rental user").select("-user.password").sort({createdAt: -1});
//         res.json({
//             success: true, bookings
//         })

//     } catch (error) {
//         console.log(error.message);
//         res.json({ success: false, message: error.message })
//     }
// }

module.exports = {checkAvailability, checkRentalAvailability, createBooking, getserviceproviderBookings, getUserBookings}