const express = require("express");
const protect = require("../middlewares/auth");
const {
    postListing,
    getMyListings,
    editListing,
    deleteListing,
    getAllListings,
    placeOrder,
    getMyPurchases,
    getMySales,
} = require("../controllers/marketplaceController");

const marketplaceRouter = express.Router();

// ─── Farmer ───────────────────────────────────────────────────────────────────
marketplaceRouter.post("/post",       protect, postListing);
marketplaceRouter.get("/mine",        protect, getMyListings);
marketplaceRouter.post("/edit",       protect, editListing);
marketplaceRouter.post("/delete",     protect, deleteListing);
marketplaceRouter.get("/mysales",     protect, getMySales);

// ─── Service Provider ─────────────────────────────────────────────────────────
marketplaceRouter.get("/all",         getAllListings);
marketplaceRouter.post("/order",      protect, placeOrder);
marketplaceRouter.get("/mypurchases", protect, getMyPurchases);

module.exports = marketplaceRouter;
