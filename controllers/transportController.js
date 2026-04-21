const transportModel        = require("../models/transportmodel");
const transportBookingModel  = require("../models/transportBookingModel");

async function isBookedOnDate(transportId, date) {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const booking = await transportBookingModel.findOne({ transport: transportId, status: "Accepted", pickupDate: { $gte: d, $lt: next } });
    return !!booking;
}

async function postTransport(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { name, category, price, capacity, route, description, image } = req.body;
        if (!name || !category || !price || !capacity || !route || !description) return res.json({ success: false, message: "Please fill all required fields." });
        const transport = await transportModel.create({ owner: _id, name, category, price: Number(price), capacity, route, description, image: image || "" });
        res.json({ success: true, message: "Transport listed successfully", transport });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getMyTransport(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const listings = await transportModel.find({ owner: _id }).sort({ createdAt: -1 });
        const today = new Date();
        const withBookings = await Promise.all(listings.map(async (t) => {
            const bookings = await transportBookingModel.find({ transport: t._id }).sort({ createdAt: -1 });
            const bookedToday = await isBookedOnDate(t._id, today);
            return { ...t.toObject(), bookings, bookedToday };
        }));
        res.json({ success: true, transport: withBookings });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function editTransport(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { transportId, name, category, price, capacity, route, description, image, status } = req.body;
        const transport = await transportModel.findById(transportId);
        if (!transport) return res.json({ success: false, message: "Listing not found" });
        if (transport.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });
        if (name) transport.name = name;
        if (category) transport.category = category;
        if (price) transport.price = Number(price);
        if (capacity) transport.capacity = capacity;
        if (route) transport.route = route;
        if (description) transport.description = description;
        if (image) transport.image = image;
        if (status) transport.status = status;
        await transport.save();
        res.json({ success: true, message: "Listing updated", transport });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function deleteTransport(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { transportId } = req.body;
        const transport = await transportModel.findById(transportId);
        if (!transport) return res.json({ success: false, message: "Listing not found" });
        if (transport.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });
        await transportModel.findByIdAndDelete(transportId);
        await transportBookingModel.deleteMany({ transport: transportId });
        res.json({ success: true, message: "Listing deleted" });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function decideBooking(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { bookingId, decision } = req.body;
        if (!["Accepted", "Rejected"].includes(decision)) return res.json({ success: false, message: "Invalid decision." });
        const booking = await transportBookingModel.findById(bookingId).populate("transport");
        if (!booking) return res.json({ success: false, message: "Booking not found" });
        if (booking.transport.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });
        if (decision === "Accepted") {
            const alreadyBooked = await isBookedOnDate(booking.transport._id, booking.pickupDate);
            if (alreadyBooked) return res.json({ success: false, message: "This vehicle already has an accepted booking for that date." });
        }
        booking.status = decision;
        await booking.save();
        res.json({ success: true, message: `Booking ${decision}`, booking });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getAllTransport(req, res) {
    try {
        const listings = await transportModel
            .find({ status: "active" })
            .populate("owner", "username name")
            .sort({ createdAt: -1 });
        const today = new Date();
        const withAvailability = await Promise.all(listings.map(async (t) => {
            const bookedToday = await isBookedOnDate(t._id, today);
            return {
                ...t.toObject(),
                ownerName:    t.owner?.name || t.owner?.username || "Operator",
                availability: bookedToday ? "Booked" : "Available",
            };
        }));
        res.json({ success: true, transport: withAvailability });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function checkDateAvailability(req, res) {
    try {
        const { transportId, date } = req.body;
        const transport = await transportModel.findById(transportId);
        if (!transport) return res.json({ success: false, message: "Transport listing not found." });
        const booked = await isBookedOnDate(transportId, date);
        res.json({ success: true, available: !booked, message: booked ? "This vehicle is already booked for the selected date." : "This vehicle is available for the selected date." });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function applyForTransport(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can apply for transport." });
        const { transportId, farmerName, farmerContact, pickupDate, pickupLocation, dropLocation, cropName, estimatedWeight, notes, distance } = req.body;
        if (!transportId || !farmerName || !farmerContact || !pickupDate || !pickupLocation || !dropLocation || !cropName || !estimatedWeight) return res.json({ success: false, message: "Please fill all required fields." });
        const transport = await transportModel.findById(transportId);
        if (!transport) return res.json({ success: false, message: "Transport listing not found." });
        if (transport.status !== "active") return res.json({ success: false, message: "This listing is no longer active." });
        const alreadyBooked = await isBookedOnDate(transportId, pickupDate);
        if (alreadyBooked) return res.json({ success: false, message: "This vehicle is already booked for that date." });
        const existing = await transportBookingModel.findOne({ transport: transportId, farmer: _id, status: "Pending", pickupDate: new Date(pickupDate) });
        if (existing) return res.json({ success: false, message: "You already have a pending application for this vehicle on that date." });
        const booking = await transportBookingModel.create({ transport: transportId, farmer: _id, farmerName, farmerContact, pickupDate: new Date(pickupDate), pickupLocation, dropLocation, cropName, estimatedWeight, notes: notes || "", distance: Number(distance) || 0 });
        res.json({ success: true, message: "Application submitted successfully", booking });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getMyApplications(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });
        const bookings = await transportBookingModel.find({ farmer: _id }).populate("transport", "name category price route image").sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getOngoingDeals(req, res) {
    try {
        const { _id, role } = req.user;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (role === "serviceprovider") {
            const myListings = await transportModel.find({ owner: _id }).select("_id");
            const ids = myListings.map((t) => t._id);
            const deals = await transportBookingModel.find({ transport: { $in: ids }, status: "Accepted", pickupDate: { $gte: today } }).populate("transport", "name category route price").sort({ pickupDate: 1 });
            return res.json({ success: true, deals });
        } else {
            const deals = await transportBookingModel.find({ farmer: _id, status: "Accepted", pickupDate: { $gte: today } }).populate("transport", "name category route price").sort({ pickupDate: 1 });
            return res.json({ success: true, deals });
        }
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getRejectedApplications(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });
        const bookings = await transportBookingModel.find({ farmer: _id, status: "Rejected" }).populate("transport", "name category").sort({ updatedAt: -1 }).limit(10);
        res.json({ success: true, bookings });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

// ─── Farmer: Pay for an accepted transport booking ────────────────────────────
async function payBooking(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can make payments." });
        const { bookingId, totalAmount } = req.body;
        const booking = await transportBookingModel.findById(bookingId);
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
    postTransport, getMyTransport, editTransport, deleteTransport,
    decideBooking, getAllTransport, checkDateAvailability,
    applyForTransport, getMyApplications, getOngoingDeals,
    getRejectedApplications, payBooking,
};
