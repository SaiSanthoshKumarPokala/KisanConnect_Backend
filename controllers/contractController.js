const contractmodel = require("../models/contractmodel");
const contractApplicationModel = require("../models/contractApplicationModel");

// ─── Service Provider: Post a new contract ────────────────────────────────────
async function postContract(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "serviceprovider") {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const {
            company, companyType, crop, variety, region, season,
            minLand, totalLand, farmersNeeded, duration,
            priceMin, priceMax, qualityStd, inputSupport, paymentTerms, notes
        } = req.body;

        if (!company || !crop || !region || !season || !minLand || !totalLand || !farmersNeeded || !duration || !priceMin || !priceMax || !paymentTerms) {
            return res.json({ success: false, message: "Please fill all required fields." });
        }

        const contract = await contractmodel.create({
            owner: _id,
            company, companyType, crop, variety, region, season,
            minLand: Number(minLand),
            totalLand: Number(totalLand),
            farmersNeeded: Number(farmersNeeded),
            duration, priceMin: Number(priceMin),
            priceMax: Number(priceMax),
            qualityStd, inputSupport: inputSupport === true || inputSupport === "true",
            paymentTerms, notes
        });

        res.json({ success: true, message: "Contract posted successfully", contract });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Service Provider: Get own contracts with applications ────────────────────
async function getMyContracts(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "serviceprovider") {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const contracts = await contractmodel.find({ owner: _id }).sort({ createdAt: -1 });

        // Attach applications to each contract
        const contractsWithApps = await Promise.all(
            contracts.map(async (contract) => {
                const applications = await contractApplicationModel
                    .find({ contract: contract._id })
                    .sort({ createdAt: -1 });
                return { ...contract.toObject(), applications };
            })
        );

        res.json({ success: true, contracts: contractsWithApps });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Service Provider: Accept or Reject a farmer application ─────────────────
async function decideApplication(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "serviceprovider") {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const { applicationId, decision } = req.body;

        if (!["Accepted", "Rejected"].includes(decision)) {
            return res.json({ success: false, message: "Invalid decision. Use Accepted or Rejected." });
        }

        const application = await contractApplicationModel
            .findById(applicationId)
            .populate("contract");

        if (!application) {
            return res.json({ success: false, message: "Application not found" });
        }

        // Confirm this contract belongs to the requesting service provider
        if (application.contract.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        application.status = decision;
        await application.save();

        res.json({ success: true, message: `Application ${decision}` });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Service Provider: Close a contract ──────────────────────────────────────
async function closeContract(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "serviceprovider") {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const { contractId } = req.body;
        const contract = await contractmodel.findById(contractId);

        if (!contract) {
            return res.json({ success: false, message: "Contract not found" });
        }

        if (contract.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        contract.status = "Closed";
        await contract.save();

        res.json({ success: true, message: "Contract closed successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Browse all active contracts ─────────────────────────────────────
async function getAllContracts(req, res) {
    try {
        const { crop, region, season } = req.query;

        let filter = { status: "Active" };
        if (crop)   filter.crop   = new RegExp(crop, "i");
        if (region) filter.region = new RegExp(region, "i");
        if (season) filter.season = season;

        const contracts = await contractmodel.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, contracts });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Apply for a contract ────────────────────────────────────────────
async function applyForContract(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "farmer") {
            return res.json({ success: false, message: "Only farmers can apply for contracts." });
        }

        const { contractId, name, phone, location, land, experience, currentCrop, message } = req.body;

        if (!contractId || !name || !phone || !land || !experience) {
            return res.json({ success: false, message: "Please fill all required fields." });
        }

        // Check contract exists and is active
        const contract = await contractmodel.findById(contractId);
        if (!contract) {
            return res.json({ success: false, message: "Contract not found." });
        }
        if (contract.status !== "Active") {
            return res.json({ success: false, message: "This contract is no longer active." });
        }

        // Prevent duplicate applications
        const existing = await contractApplicationModel.findOne({ contract: contractId, farmer: _id });
        if (existing) {
            return res.json({ success: false, message: "You have already applied for this contract." });
        }

        const application = await contractApplicationModel.create({
            contract: contractId,
            farmer: _id,
            name, phone, location,
            land: Number(land),
            experience,
            currentCrop: currentCrop || "",
            message: message || ""
        });

        res.json({ success: true, message: "Application submitted successfully", application });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// ─── Farmer: Get own applications ────────────────────────────────────────────
async function getMyApplications(req, res) {
    try {
        const { _id, role } = req.user;

        if (role !== "farmer") {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const applications = await contractApplicationModel
            .find({ farmer: _id })
            .populate("contract")
            .sort({ createdAt: -1 });

        res.json({ success: true, applications });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


// ─── Both: Get ongoing accepted contract deals (for notification panel) ────────
async function getOngoingDeals(req, res) {
    try {
        const { _id, role } = req.user;

        if (role === "serviceprovider") {
            // SP: accepted applications on their active contracts
            const myContracts = await contractmodel
                .find({ owner: _id, status: "Active" })
                .select("_id");
            const contractIds = myContracts.map((c) => c._id);

            const deals = await contractApplicationModel
                .find({ contract: { $in: contractIds }, status: "Accepted" })
                .populate("contract", "crop variety company region season priceMin priceMax duration")
                .sort({ createdAt: -1 });

            return res.json({ success: true, deals });
        } else {
            // Farmer: their own accepted applications on active contracts
            const deals = await contractApplicationModel
                .find({ farmer: _id, status: "Accepted" })
                .populate("contract", "crop variety company region season priceMin priceMax duration status")
                .sort({ createdAt: -1 });

            // Filter to only contracts that are still Active
            const activeDeals = deals.filter(
                (d) => d.contract && d.contract.status === "Active"
            );

            return res.json({ success: true, deals: activeDeals });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

module.exports = {
    postContract,
    getMyContracts,
    decideApplication,
    closeContract,
    getAllContracts,
    applyForContract,
    getMyApplications,
    getOngoingDeals,
};
