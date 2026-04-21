const coldstorageModel        = require("../models/coldstoragemodel");
const coldStorageBookingModel  = require("../models/coldStorageBookingModel");

async function getOccupiedQuantity(storageId, startDate, endDate) {
    const overlapping = await coldStorageBookingModel.find({
        storage: storageId, status: "Accepted",
        startDate: { $lte: new Date(endDate) },
        endDate:   { $gte: new Date(startDate) },
    });
    return overlapping.reduce((sum, b) => sum + b.quantity, 0);
}

async function postStorage(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { name, location, capacity, price, images } = req.body;
        if (!name || !location || !capacity || !price) return res.json({ success: false, message: "Please fill all required fields." });
        const storage = await coldstorageModel.create({ owner: _id, name, location, capacity: Number(capacity), price: Number(price), images: images || [] });
        res.json({ success: true, message: "Storage listed successfully", storage });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getMyStorages(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const storages = await coldstorageModel.find({ owner: _id }).sort({ createdAt: -1 });
        const today = new Date();
        const storagesWithBookings = await Promise.all(storages.map(async (storage) => {
            const bookings = await coldStorageBookingModel.find({ storage: storage._id }).sort({ createdAt: -1 });
            const activeOccupied = await getOccupiedQuantity(storage._id, today.toISOString(), today.toISOString());
            return { ...storage.toObject(), bookings, occupiedNow: activeOccupied, availableNow: Math.max(0, storage.capacity - activeOccupied) };
        }));
        res.json({ success: true, storages: storagesWithBookings });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function editStorage(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { storageId, name, location, capacity, price, images, status } = req.body;
        const storage = await coldstorageModel.findById(storageId);
        if (!storage) return res.json({ success: false, message: "Storage not found" });
        if (storage.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });
        if (name) storage.name = name;
        if (location) storage.location = location;
        if (capacity) storage.capacity = Number(capacity);
        if (price) storage.price = Number(price);
        if (status) storage.status = status;
        if (images && images.length > 0) storage.images = images;
        await storage.save();
        res.json({ success: true, message: "Storage updated", storage });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function deleteStorage(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { storageId } = req.body;
        const storage = await coldstorageModel.findById(storageId);
        if (!storage) return res.json({ success: false, message: "Storage not found" });
        if (storage.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });
        await coldstorageModel.findByIdAndDelete(storageId);
        await coldStorageBookingModel.deleteMany({ storage: storageId });
        res.json({ success: true, message: "Storage deleted" });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function decideBooking(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const { bookingId, decision } = req.body;
        if (!["Accepted", "Rejected"].includes(decision)) return res.json({ success: false, message: "Invalid decision." });
        const booking = await coldStorageBookingModel.findById(bookingId).populate("storage");
        if (!booking) return res.json({ success: false, message: "Booking not found" });
        if (booking.storage.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });
        if (decision === "Accepted") {
            const occupied  = await getOccupiedQuantity(booking.storage._id, booking.startDate, booking.endDate);
            const available = booking.storage.capacity - occupied;
            if (available < booking.quantity) return res.json({ success: false, message: `Not enough capacity. Only ${available} tonnes available.` });
        }
        booking.status = decision;
        await booking.save();
        res.json({ success: true, message: `Booking ${decision}`, booking });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getAllStorages(req, res) {
    try {
        const storages = await coldstorageModel.find({ status: "active" }).sort({ createdAt: -1 });
        res.json({ success: true, storages });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function checkAvailability(req, res) {
    try {
        const { storageId, startDate, endDate } = req.body;
        const storage = await coldstorageModel.findById(storageId);
        if (!storage) return res.json({ success: false, message: "Storage not found" });
        const occupied  = await getOccupiedQuantity(storageId, startDate, endDate);
        const available = Math.max(0, storage.capacity - occupied);
        res.json({ success: true, totalCapacity: storage.capacity, occupiedTonnes: occupied, availableTonnes: available });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function applyForStorage(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can apply for cold storage." });
        const { storageId, farmerName, farmerLocation, farmerContact, cropName, startDate, endDate, quantity } = req.body;
        if (!storageId || !farmerName || !farmerLocation || !farmerContact || !cropName || !startDate || !endDate || !quantity) return res.json({ success: false, message: "Please fill all required fields." });
        const storage = await coldstorageModel.findById(storageId);
        if (!storage) return res.json({ success: false, message: "Storage not found." });
        if (storage.status !== "active") return res.json({ success: false, message: "This storage is not active." });
        if (new Date(endDate) <= new Date(startDate)) return res.json({ success: false, message: "End date must be after start date." });
        const existing = await coldStorageBookingModel.findOne({ storage: storageId, farmer: _id, status: "Pending", startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } });
        if (existing) return res.json({ success: false, message: "You already have a pending application for those dates." });
        const booking = await coldStorageBookingModel.create({ storage: storageId, farmer: _id, farmerName, farmerLocation, farmerContact, cropName, startDate: new Date(startDate), endDate: new Date(endDate), quantity: Number(quantity) });
        res.json({ success: true, message: "Application submitted successfully", booking });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getMyBookings(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });
        const bookings = await coldStorageBookingModel.find({ farmer: _id }).populate("storage", "name location price").sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

async function getOngoingDeals(req, res) {
    try {
        const { _id, role } = req.user;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (role === "serviceprovider") {
            const myStorages = await coldstorageModel.find({ owner: _id }).select("_id");
            const ids = myStorages.map((s) => s._id);
            const deals = await coldStorageBookingModel.find({ storage: { $in: ids }, status: "Accepted", endDate: { $gte: today } }).populate("storage", "name location price").sort({ endDate: 1 });
            return res.json({ success: true, deals });
        } else {
            const deals = await coldStorageBookingModel.find({ farmer: _id, status: "Accepted", endDate: { $gte: today } }).populate("storage", "name location price").sort({ endDate: 1 });
            return res.json({ success: true, deals });
        }
    } catch (error) { console.log(error.message); res.json({ success: false, message: error.message }); }
}

// ─── Farmer: Pay for an accepted cold storage booking ─────────────────────────
async function payBooking(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can make payments." });

        const { bookingId, totalAmount } = req.body;
        const booking = await coldStorageBookingModel.findById(bookingId);
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
    postStorage, getMyStorages, editStorage, deleteStorage,
    decideBooking, getAllStorages, checkAvailability,
    applyForStorage, getMyBookings, getOngoingDeals, payBooking,
};
