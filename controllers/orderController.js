const Razorpay   = require("razorpay");
const orderModel = require("../models/ordermodel");

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay order ────────────────────────────────────────────────────
async function Order(req, res) {
    try {
        const { product, amount } = req.body;

        if (!product || !amount) {
            return res.json({ success: false, message: "Product and amount are required." });
        }

        // Create order on Razorpay (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount:   Math.round(amount * 100),
            currency: "INR",
            receipt:  `receipt_${Date.now()}`,
        });

        // Save pending order in DB — paymentId left empty until verified
        await orderModel.create({
            farmer:          req.user._id,
            items:           Array.isArray(product) ? product : [product],
            totalAmount:     Math.round(amount * 100),
            razorpayOrderId: razorpayOrder.id,
            status:          "pending",
        });

        res.json({ success: true, order: razorpayOrder });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Verify payment after Razorpay callback ───────────────────────────────────
async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.json({ success: false, message: "Missing payment details." });
        }

        // Fetch order status from Razorpay
        const orderInfo = await razorpay.orders.fetch(razorpay_order_id);

        if (orderInfo.status === "paid") {
            // Update DB order using razorpayOrderId (not receipt which is a string)
            await orderModel.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    payment:           true,
                    status:            "paid",
                    razorpayPaymentId: razorpay_payment_id,
                    paidAt:            new Date(),
                }
            );
            res.json({ success: true, message: "Payment verified successfully." });
        } else {
            res.json({ success: false, message: "Payment not completed." });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

module.exports = { Order, verifyPayment };
