const express = require("express");
const protect = require("../middlewares/auth");
const {
    postRental, getMyRentals, editRental, deleteRental,
    decideBooking, getAllRentals, checkDateAvailability,
    applyForRental, getMyApplications, getOngoingDeals,
    getRejectedApplications, payBooking,
} = require("../controllers/rentalsController");

const rentalsRouter = express.Router();

// ─── Service Provider ─────────────────────────────────────────────────────────
rentalsRouter.post("/post",    protect, postRental);
rentalsRouter.get("/mine",     protect, getMyRentals);
rentalsRouter.post("/edit",    protect, editRental);
rentalsRouter.post("/delete",  protect, deleteRental);
rentalsRouter.post("/decide",  protect, decideBooking);

// ─── Farmer ───────────────────────────────────────────────────────────────────
rentalsRouter.get("/all",            getAllRentals);
rentalsRouter.post("/checkdate",     checkDateAvailability);
rentalsRouter.post("/apply",         protect, applyForRental);
rentalsRouter.get("/myapplications", protect, getMyApplications);
rentalsRouter.get("/rejected",       protect, getRejectedApplications);

// ─── Both ─────────────────────────────────────────────────────────────────────
rentalsRouter.get("/mydeals",        protect, getOngoingDeals);
rentalsRouter.post("/pay",           protect, payBooking);

module.exports = rentalsRouter;
