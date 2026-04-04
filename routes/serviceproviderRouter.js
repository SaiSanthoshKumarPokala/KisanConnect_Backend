const express = require("express");
const protect = require("../middlewares/auth");
const { changeRole, addRental, getserviceproviderData, toggleRentalAvailability, deleteRental, submitDetails } = require("../controllers/serviceproviderController");
const upload = require("../middlewares/multer");

const serviceproviderRouter = express.Router();

serviceproviderRouter.post("/changerole", protect, changeRole);
serviceproviderRouter.post("/addrental", upload.single("image"), protect, addRental)
serviceproviderRouter.get("/rentals", protect, getserviceproviderData);
serviceproviderRouter.post("/submitdetails", protect, submitDetails);
serviceproviderRouter.post("/delete", protect, deleteRental);
serviceproviderRouter.post("/toggle", protect, toggleRentalAvailability);
module.exports = serviceproviderRouter;