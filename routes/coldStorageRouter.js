const express = require("express");
const protect = require("../middlewares/auth");
const {
    postStorage, getMyStorages, editStorage, deleteStorage,
    decideBooking, getAllStorages, checkAvailability,
    applyForStorage, getMyBookings, getOngoingDeals, payBooking,
} = require("../controllers/coldStorageController");

const coldStorageRouter = express.Router();

// ─── Service Provider (protected) ────────────────────────────────────────────
coldStorageRouter.post("/post",    protect, postStorage);
coldStorageRouter.get("/mine",     protect, getMyStorages);
coldStorageRouter.post("/edit",    protect, editStorage);
coldStorageRouter.post("/delete",  protect, deleteStorage);
coldStorageRouter.post("/decide",  protect, decideBooking);

// ─── Farmer (protected) ───────────────────────────────────────────────────────
coldStorageRouter.get("/all",             getAllStorages);
coldStorageRouter.post("/check",          checkAvailability);
coldStorageRouter.post("/apply",          protect, applyForStorage);
coldStorageRouter.get("/mybookings",      protect, getMyBookings);

// ─── Both roles ───────────────────────────────────────────────────────────────
coldStorageRouter.get("/mydeals",         protect, getOngoingDeals);
coldStorageRouter.post("/pay",            protect, payBooking);

module.exports = coldStorageRouter;
