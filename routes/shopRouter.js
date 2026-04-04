const express = require("express");
const router = express.Router();
const productModel = require("../models/productmodel");


const db = require("../config/mongooseconnection");
const coll = db.collection("products");
router.get("/", async function (req, res) {
    try {
        let products = await productModel.find({});
        res.json({success:true, products});
        // console.log(products);
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error });
    }
})

router.post("/", async function (req, res) {
    const item = new productModel({
        name: req.body.name,
        seller: req.body.seller,
        price: req.body.price,
        rating: req.body.rating,
        category: req.body.category
    })
    try {
        await item.save();
        res.json({success:true, message: "Added"});
    } catch (error) {
        console.log(error);
        res.json({success:false, message: error});
    }
})

module.exports = router;
