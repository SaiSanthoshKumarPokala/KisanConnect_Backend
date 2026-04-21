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
const contractRouter = require("./routes/contractRouter");
const coldStorageRouter = require("./routes/coldStorageRouter");
const marketplaceRouter = require("./routes/marketplaceRouter");
const orderRouter = require("./routes/orderRouter");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
    origin: "http://localhost:5173",
    // origin: ["http://192.168.1.7:5173","http://localhost:5173"],
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use("/api/user", userRouter);
app.use("/api/farmer", farmerRouter);
app.use("/api/serviceprovider", serviceproviderRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/contractfarming", contractRouter);
app.use("/api/coldstorage", coldStorageRouter);
app.use("/api/transport", transportRouter);
app.use("/api/rentals", rentalsRouter);
app.use("/api/shop", shopRouter);
app.use("/api/marketplace", marketplaceRouter);
app.use("/products", productsRouter);
app.use("/api/buy", orderRouter)

const port = process.env.PORT || 3000;
app.listen(port);
