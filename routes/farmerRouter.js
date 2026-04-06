const express = require("express");
const { getFarmerData, getRentals, changeRole, submitDetails, getData } = require("../controllers/farmerController");
const protect = require("../middlewares/auth");
const router = express.Router();

const farmerRouter = express.Router();


farmerRouter.get('/rentals', getRentals);
farmerRouter.get('/data',protect, getData);
farmerRouter.post('/changerole',protect, changeRole);
farmerRouter.post('/submitdetails',protect, submitDetails);


module.exports = farmerRouter;