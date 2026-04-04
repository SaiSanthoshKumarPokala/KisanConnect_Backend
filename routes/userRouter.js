const express = require("express");
const { registerUser, LoginUser, getUserData, selectRole } = require("../controllers/userController");
const protect = require("../middlewares/auth"); 

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',LoginUser);
userRouter.get('/data', protect, getUserData);
userRouter.post('/role', protect, selectRole);


module.exports = userRouter;