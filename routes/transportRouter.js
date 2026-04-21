const express = require("express");
const protect = require("../middlewares/auth");
const {
    postTransport, getMyTransport, editTransport, deleteTransport,
    decideBooking, getAllTransport, applyForTransport,
    getMyApplications, getOngoingDeals, getRejectedApplications,
    checkDateAvailability, payBooking,
} = require("../controllers/transportController");

const transportRouter = express.Router();

// ─── Service Provider ─────────────────────────────────────────────────────────
transportRouter.post("/post",    protect, postTransport);
transportRouter.get("/mine",     protect, getMyTransport);
transportRouter.post("/edit",    protect, editTransport);
transportRouter.post("/delete",  protect, deleteTransport);
transportRouter.post("/decide",  protect, decideBooking);

// ─── Farmer ───────────────────────────────────────────────────────────────────
transportRouter.get("/all",              getAllTransport);
transportRouter.post("/checkdate",       checkDateAvailability);
transportRouter.post("/apply",           protect, applyForTransport);
transportRouter.get("/myapplications", protect, getMyApplications);
transportRouter.get("/rejected",     protect, getRejectedApplications);

// ─── Both ─────────────────────────────────────────────────────────────────────
transportRouter.get("/mydeals",      protect, getOngoingDeals);
transportRouter.post("/pay",         protect, payBooking);

module.exports = transportRouter;
