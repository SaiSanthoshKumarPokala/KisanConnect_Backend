const express = require("express");
const { getFarmerData, getRentals, changeRole, submitDetails } = require("../controllers/farmerController");
const protect = require("../middlewares/auth");
const router = express.Router();

const farmerRouter = express.Router();


farmerRouter.get('/data', protect, getFarmerData);
farmerRouter.get('/rentals', getRentals);
farmerRouter.post('/changerole',protect, changeRole);
farmerRouter.post('/submitdetails',protect, submitDetails);


module.exports = farmerRouter;