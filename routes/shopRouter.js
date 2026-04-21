const express = require("express");
const protect = require("../middlewares/auth");
const {
    postProduct,
    getMyProducts,
    editProduct,
    deleteProduct,
    getAllProducts,
    placeOrder,
    getMyOrders,
    getMyPurchases,
} = require("../controllers/shopController");

const shopRouter = express.Router();

// ─── Service Provider ─────────────────────────────────────────────────────────
shopRouter.post("/post",       protect, postProduct);
shopRouter.get("/mine",        protect, getMyProducts);
shopRouter.post("/edit",       protect, editProduct);
shopRouter.post("/delete",     protect, deleteProduct);
shopRouter.get("/myorders",    protect, getMyOrders);

// ─── Farmer ───────────────────────────────────────────────────────────────────
shopRouter.get("/all",         getAllProducts);
shopRouter.post("/order",      protect, placeOrder);
shopRouter.get("/mypurchases", protect, getMyPurchases);

module.exports = shopRouter;
