const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv/config");

const app = express();


const db = require("./config/mongooseconnection");
const userRouter = require("./routes/userRouter");
const serviceproviderRouter = require("./routes/serviceproviderRouter");
const farmerRouter = require("./routes/farmerRouter");
const productsRouter = require("./routes/productsRouter");
const rentalsRouter = require("./routes/rentalsRouter");
const transportRouter = require("./routes/transportRouter");
const shopRouter = require("./routes/shopRouter");
const bookingRouter = require("./routes/bookingRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.set("view engine","ejs");
app.use(cors({origin:"http://localhost:5173",allowedHeaders:['Authorization','Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// var corsOptions = {
//   origin: 'http://localhost:5173',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

app.use("/api/user", userRouter)
app.use("/api/farmer", farmerRouter);
app.use("/api/serviceprovider", serviceproviderRouter);
app.use("/api/bookings",bookingRouter);
app.use("/shop", shopRouter);
app.use("/products", productsRouter);
app.use("/rentals", rentalsRouter);
app.use("/transport", transportRouter);

const port = process.env.PORT || 3000;
app.listen(port);