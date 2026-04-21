const marketplaceListingModel = require("../models/marketplaceListingModel");
const marketplaceOrderModel   = require("../models/marketplaceOrderModel");

// ─── Farmer: Post a listing ───────────────────────────────────────────────────
async function postListing(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Only farmers can post marketplace listings." });

        const { name, category, price, stock, location, description, image } = req.body;
        if (!name || !category || !price || !stock || !location || !description) {
            return res.json({ success: false, message: "Please fill all required fields." });
        }

        const listing = await marketplaceListingModel.create({
            owner: _id, name, category,
            price:        Number(price),
            stock:        Number(stock),
            location, description,
            image:        image || "",
            availability: "Available",
        });

        res.json({ success: true, message: "Listing posted successfully", listing });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get own listings ─────────────────────────────────────────────────
async function getMyListings(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });

        const listings = await marketplaceListingModel.find({ owner: _id }).sort({ createdAt: -1 });
        res.json({ success: true, listings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Edit a listing ───────────────────────────────────────────────────
async function editListing(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });

        const { listingId, name, category, price, stock, location, description, image, status } = req.body;
        const listing = await marketplaceListingModel.findById(listingId);
        if (!listing) return res.json({ success: false, message: "Listing not found" });
        if (listing.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        if (name)        listing.name        = name;
        if (category)    listing.category    = category;
        if (price)       listing.price       = Number(price);
        if (location)    listing.location    = location;
        if (description) listing.description = description;
        if (image)       listing.image       = image;
        if (status)      listing.status      = status;

        if (stock !== undefined && stock !== "") {
            listing.stock = Number(stock);
            // Restore if stock is back > 0
            if (Number(stock) > 0) {
                listing.availability = "Available";
                listing.status       = "active";
            }
        }

        await listing.save();
        res.json({ success: true, message: "Listing updated", listing });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Delete a listing ─────────────────────────────────────────────────
async function deleteListing(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });

        const { listingId } = req.body;
        const listing = await marketplaceListingModel.findById(listingId);
        if (!listing) return res.json({ success: false, message: "Listing not found" });
        if (listing.owner.toString() !== _id.toString()) return res.json({ success: false, message: "Unauthorized" });

        await marketplaceListingModel.findByIdAndDelete(listingId);
        res.json({ success: true, message: "Listing deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Get all active available listings ────────────────────────────────────
async function getAllListings(req, res) {
    try {
        const listings = await marketplaceListingModel
            .find({ status: "active", availability: "Available" })
            .sort({ createdAt: -1 });
        res.json({ success: true, listings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── SP: Place an order — validates + deducts stock ───────────────────────────
async function placeOrder(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Only service providers can place marketplace orders." });

        const { items, totalAmount } = req.body;
        if (!items || !items.length || !totalAmount) {
            return res.json({ success: false, message: "Order items and total are required." });
        }

        // Validate stock before committing
        for (const item of items) {
            const listing = await marketplaceListingModel.findById(item.listingId);
            if (!listing) return res.json({ success: false, message: `Listing "${item.name}" not found.` });
            if (listing.stock < Number(item.quantity)) {
                return res.json({
                    success: false,
                    message: `Only ${listing.stock} kg available for "${listing.name}". Please reduce quantity.`,
                });
            }
        }

        // Deduct stock from each listing
        for (const item of items) {
            const listing = await marketplaceListingModel.findById(item.listingId);
            listing.stock -= Number(item.quantity);
            if (listing.stock <= 0) {
                listing.stock        = 0;
                listing.availability = "Out of Stock";
                listing.status       = "inactive";
            }
            await listing.save();
        }

        // Save the order
        const orderItems = items.map((item) => ({
            listing:  item.listingId,
            name:     item.name,
            category: item.category  || "",
            price:    Number(item.price),
            quantity: Number(item.quantity),
            image:    item.image     || "",
            owner:    item.owner,
        }));

        const order = await marketplaceOrderModel.create({
            buyer:       _id,
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

// ─── SP: Get own purchases ────────────────────────────────────────────────────
async function getMyPurchases(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "serviceprovider") return res.json({ success: false, message: "Unauthorized" });
        const orders = await marketplaceOrderModel.find({ buyer: _id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get sales on their listings ─────────────────────────────────────
async function getMySales(req, res) {
    try {
        const { _id, role } = req.user;
        if (role !== "farmer") return res.json({ success: false, message: "Unauthorized" });

        const orders = await marketplaceOrderModel.find({ "items.owner": _id }).sort({ createdAt: -1 });
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

module.exports = {
    postListing, getMyListings, editListing, deleteListing,
    getAllListings, placeOrder, getMyPurchases, getMySales,
};
