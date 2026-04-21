const express = require("express");
const protect = require("../middlewares/auth");
const {
    postContract,
    getMyContracts,
    decideApplication,
    closeContract,
    getAllContracts,
    applyForContract,
    getMyApplications,
    getOngoingDeals,
} = require("../controllers/contractController");

const contractRouter = express.Router();

// ─── Service Provider routes ──────────────────────────────────────────────────
contractRouter.post("/post",          protect, postContract);
contractRouter.get("/mycontracts",    protect, getMyContracts);
contractRouter.post("/decide",        protect, decideApplication);
contractRouter.post("/close",         protect, closeContract);

// ─── Farmer routes ────────────────────────────────────────────────────────────
contractRouter.get("/all",            getAllContracts);
contractRouter.post("/apply",         protect, applyForContract);
contractRouter.get("/myapplications", protect, getMyApplications);

// ─── Both roles ───────────────────────────────────────────────────────────────
contractRouter.get("/mydeals",        protect, getOngoingDeals);

module.exports = contractRouter;
