const express = require("express");
const protect = require("../middlewares//auth");
const {Order, verifyPayment} = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/order",protect, Order);
orderRouter.post("/verify",protect, verifyPayment );

module.exports = orderRouter;