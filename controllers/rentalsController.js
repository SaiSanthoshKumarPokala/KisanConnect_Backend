const rentalModel        = require("../models/rentalmodel");
const rentalBookingModel  = require("../models/rentalBookingModel");

// ─── Helper: date range overlap check ────────────────────────────────────────
async function hasOverlap(rentalId, startDate, endDate) {
    const booking = await rentalBookingModel.findOne({
        rental:    rentalId,
        status:    "Accepted",
        startDate: { $lt: new Date(endDate) },
        endDate:   { $gt: new Date(startDate) },
    });
    return !!booking;
}

// ─── SP: Post a rental ───────────────────────────────────────────────────────
async function postRental(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { name, category, price, location, description, image } = req.body;
        if (!name || !category || !price || !location || !description) {
            return res.json({ success: false, message: "Please fill all required fields." });
        }

        const rental = await rentalModel.create({
            owner: _id, name, category,
            price: Number(price), location, description,
            image: image || "",
        });

        res.json({ success: true, message: "Rental listed successfully", rental });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Get own listings with bookings ──────────────────────────────────────
async function getMyRentals(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const listings = await rentalModel.find({ owner: _id }).sort({ createdAt: -1 });
        const withBookings = await Promise.all(
            listings.map(async (r) => {
                const bookings = await rentalBookingModel.find({ rental: r._id }).sort({ createdAt: -1 });
                return { ...r.toObject(), bookings };
            })
        );

        res.json({ success: true, rentals: withBookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Edit a listing ───────────────────────────────────────────────────────
async function editRental(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { rentalId, name, category, price, location, description, image, status } = req.body;
        const rental = await rentalModel.findById(rentalId);
        if (!rental) return res.json({ success: false, message: "Listing not found" });
        if (rental.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        if (name)        rental.name        = name;
        if (category)    rental.category    = category;
        if (price)       rental.price       = Number(price);
        if (location)    rental.location    = location;
        if (description) rental.description = description;
        if (image)       rental.image       = image;
        if (status)      rental.status      = status;

        await rental.save();
        res.json({ success: true, message: "Listing updated", rental });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Delete a listing ─────────────────────────────────────────────────────
async function deleteRental(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { rentalId } = req.body;
        const rental = await rentalModel.findById(rentalId);
        if (!rental) return res.json({ success: false, message: "Listing not found" });
        if (rental.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        await rentalModel.findByIdAndDelete(rentalId);
        await rentalBookingModel.deleteMany({ rental: rentalId });
        res.json({ success: true, message: "Listing deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Accept or Reject a booking ──────────────────────────────────────────
async function decideBooking(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { bookingId, decision } = req.body;
        if (!["Accepted", "Rejected"].includes(decision)) return res.json({ success: false, message: "Invalid decision." });

        const booking = await rentalBookingModel.findById(bookingId).populate("rental");
        if (!booking) return res.json({ success: false, message: "Booking not found" });
        if (booking.rental.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        if (decision === "Accepted") {
            const overlap = await hasOverlap(booking.rental._id, booking.startDate, booking.endDate);
            if (overlap) return res.json({ success: false, message: "This machine already has an accepted booking for those dates." });
        }

        booking.status = decision;
        await booking.save();
        res.json({ success: true, message: `Booking ${decision}`, booking });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get all active listings ─────────────────────────────────────────
// Populates owner name + derives today's availability from accepted bookings
async function getAllRentals(req, res) {
    try {
        const today    = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        const rentals = await rentalModel
            .find({ status: "active" })
            .populate("owner", "username name")
            .sort({ createdAt: -1 });

        const withAvailability = await Promise.all(
            rentals.map(async (r) => {
                const bookedToday = await rentalBookingModel.findOne({
                    rental:    r._id,
                    status:    "Accepted",
                    startDate: { $lte: tomorrow },
                    endDate:   { $gte: today },
                });
                return {
                    ...r.toObject(),
                    ownerName:    r.owner?.name || r.owner?.username || "Owner",
                    availability: bookedToday ? "Booked" : "Available",
                };
            })
        );

        res.json({ success: true, rentals: withAvailability });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Check date range availability ────────────────────────────────────
async function checkDateAvailability(req, res) {
    try {
        const { rentalId, startDate, endDate } = req.body;
        if (!rentalId || !startDate || !endDate) return res.json({ success: false, message: "rentalId, startDate and endDate are required." });
        if (new Date(endDate) <= new Date(startDate)) return res.json({ success: false, message: "End date must be after start date." });

        const rental = await rentalModel.findById(rentalId);
        if (!rental) return res.json({ success: false, message: "Rental not found." });

        const overlap = await hasOverlap(rentalId, startDate, endDate);
        res.json({
            success:   true,
            available: !overlap,
            message:   overlap
                ? "This machine is already booked for those dates."
                : "This machine is available for your selected dates.",
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Apply for a rental ───────────────────────────────────────────────
async function applyForRental(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can apply for rentals." });

        const { rentalId, farmerName, farmerContact, startDate, endDate, expectedHours, deliveryAddress, notes } = req.body;
        if (!rentalId || !farmerName || !farmerContact || !startDate || !endDate || !deliveryAddress) {
            return res.json({ success: false, message: "Please fill all required fields." });
        }
        if (new Date(endDate) <= new Date(startDate)) return res.json({ success: false, message: "End date must be after start date." });

        const rental = await rentalModel.findById(rentalId);
        if (!rental) return res.json({ success: false, message: "Rental not found." });
        if (rental.status !== "active") return res.json({ success: false, message: "This listing is no longer active." });

        const overlap = await hasOverlap(rentalId, startDate, endDate);
        if (overlap) return res.json({ success: false, message: "This machine is already booked for those dates." });

        const existing = await rentalBookingModel.findOne({
            rental: rentalId, farmer: _id, status: "Pending",
            startDate: { $lt: new Date(endDate) },
            endDate:   { $gt: new Date(startDate) },
        });
        if (existing) return res.json({ success: false, message: "You already have a pending application for those dates." });

        const booking = await rentalBookingModel.create({
            rental: rentalId, farmer: _id,
            farmerName, farmerContact,
            startDate: new Date(startDate), endDate: new Date(endDate),
            expectedHours: expectedHours || "", deliveryAddress,
            notes: notes || "",
        });

        res.json({ success: true, message: "Application submitted successfully", booking });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get own applications ────────────────────────────────────────────
async function getMyApplications(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });
        const bookings = await rentalBookingModel
            .find({ farmer: _id })
            .populate("rental", "name category price location image")
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Both: Ongoing accepted deals ────────────────────────────────────────────
async function getOngoingDeals(req, res) {
    try {
        const { _id, role } = req.user;
        const today = new Date(); today.setHours(0, 0, 0, 0);

        if (role === "serviceprovider") {
            const myListings = await rentalModel.find({ owner: _id }).select("_id");
            const ids = myListings.map((r) => r._id);
            const deals = await rentalBookingModel
                .find({ rental: { $in: ids }, status: "Accepted", endDate: { $gte: today } })
                .populate("rental", "name category location price")
                .sort({ startDate: 1 });
            return res.json({ success: true, deals });
        } else {
            const deals = await rentalBookingModel
                .find({ farmer: _id, status: "Accepted", endDate: { $gte: today } })
                .populate("rental", "name category location price")
                .sort({ startDate: 1 });
            return res.json({ success: true, deals });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Rejected applications ───────────────────────────────────────────
async function getRejectedApplications(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });
        const bookings = await rentalBookingModel
            .find({ farmer: _id, status: "Rejected" })
            .populate("rental", "name category")
            .sort({ updatedAt: -1 })
            .limit(10);
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Pay for an accepted rental booking ───────────────────────────────
async function payBooking(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can make payments." });
        const { bookingId, totalAmount } = req.body;
        const booking = await rentalBookingModel.findById(bookingId);
        if (!booking) return res.json({ success: false, message: "Booking not found." });
        if (booking.farmer.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized." });
        if (booking.status !== "Accepted") return res.json({ success: false, message: "Only accepted bookings can be paid." });
        if (booking.paymentStatus === "paid") return res.json({ success: false, message: "This booking is already paid." });
        booking.paymentStatus = "paid";
        booking.totalAmount   = Number(totalAmount);
        booking.paidAt        = new Date();
        await booking.save();
        res.json({ success: true, message: "Payment recorded successfully", booking });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

module.exports = {
    postRental, getMyRentals, editRental, deleteRental,
    decideBooking, getAllRentals, checkDateAvailability,
    applyForRental, getMyApplications, getOngoingDeals,
    getRejectedApplications, payBooking,
};
