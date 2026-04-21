const productModel = require("../models/productmodel");
const orderModel   = require("../models/ordermodel");

// ─── SP: Post a product ───────────────────────────────────────────────────────
async function postProduct(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { name, brand, category, price, stock, description, image } = req.body;
        if (!name || !brand || !category || !price || !stock || !description) {
            return res.json({ success: false, message: "Please fill all required fields." });
        }

        const product = await productModel.create({
            owner: _id, name, brand, category,
            price:  Number(price),
            stock:  Number(stock),
            description, image: image || "",
        });

        res.json({ success: true, message: "Product listed successfully", product });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Get own products ─────────────────────────────────────────────────────
async function getMyProducts(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const products = await productModel.find({ owner: _id }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Edit a product ───────────────────────────────────────────────────────
async function editProduct(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { productId, name, brand, category, price, stock, description, image, status } = req.body;
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });
        if (product.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        if (name)        product.name        = name;
        if (brand)       product.brand       = brand;
        if (category)    product.category    = category;
        if (price)       product.price       = Number(price);
        if (stock)       product.stock       = Number(stock);
        if (description) product.description = description;
        if (image)       product.image       = image;
        if (status)      product.status      = status;

        // If stock is set back to > 0, make sure it's active again
        if (stock && Number(stock) > 0 && product.status === "inactive") {
            product.status = "active";
        }

        await product.save();
        res.json({ success: true, message: "Product updated", product });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Delete a product ─────────────────────────────────────────────────────
async function deleteProduct(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const { productId } = req.body;
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });
        if (product.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        await productModel.findByIdAndDelete(productId);
        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get all active products ─────────────────────────────────────────
async function getAllProducts(req, res) {
    try {
        const products = await productModel.find({ status: "active" }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Place an order ───────────────────────────────────────────────────
// Deducts stock from each product after payment
async function placeOrder(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can place orders." });

        const { items, totalAmount } = req.body;
        if (!items || !items.length || !totalAmount) {
            return res.json({ success: false, message: "Order items and total are required." });
        }

        // Validate stock availability before placing
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (!product) return res.json({ success: false, message: `Product "${item.name}" not found.` });
            if (product.stock < Number(item.quantity)) {
                return res.json({
                    success: false,
                    message: `Only ${product.stock} kg available for "${product.name}". Please reduce quantity.`,
                });
            }
        }

        // Deduct stock from each product
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            product.stock -= Number(item.quantity);
            // Mark inactive if stock reaches 0
            if (product.stock <= 0) {
                product.stock  = 0;
                product.status = "inactive";
            }
            await product.save();
        }

        // Save the order
        const orderItems = items.map((item) => ({
            product:  item.productId,
            name:     item.name,
            brand:    item.brand     || "",
            price:    Number(item.price),
            quantity: Number(item.quantity),
            image:    item.image     || "",
            owner:    item.owner,
        }));

        const order = await orderModel.create({
            farmer:      _id,
            items:       orderItems,
            totalAmount: Number(totalAmount),
            paidAt:      new Date(),
        });

        res.json({ success: true, message: "Order placed successfully", order });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Get orders for their products ───────────────────────────────────────
async function getMyOrders(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });

        const orders = await orderModel.find({ "items.owner": _id }).sort({ createdAt: -1 });
        const filtered = orders.map((order) => ({
            _id:         order._id,
            paidAt:      order.paidAt,
            createdAt:   order.createdAt,
            totalAmount: order.totalAmount,
            items:       order.items.filter(
                (item) => item.owner && item.owner.toString() === _id.toString()
            ),
        }));

        res.json({ success: true, orders: filtered });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get own purchase history ────────────────────────────────────────
async function getMyPurchases(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });
        const orders = await orderModel.find({ farmer: _id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

module.exports = {
    postProduct, getMyProducts, editProduct, deleteProduct,
    getAllProducts, placeOrder, getMyOrders, getMyPurchases,
};
