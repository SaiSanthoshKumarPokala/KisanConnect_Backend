const express = require("express");
const protect = require("../middlewares//auth");
const { checkRentalAvailability, createBooking, getUserBookings, getserviceproviderBookings } = require("../controllers/bookingController");

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkRentalAvailability);
bookingRouter.post("/create",protect,createBooking);
bookingRouter.get("/userbookings", getUserBookings);
bookingRouter.get("/serviceproviderbookings", getserviceproviderBookings);


module.exports = bookingRouter;