const express = require("express");
const router = express.Router();

const Candidate = require("../models/Candidate");
const User = require("../models/User");
const Vote = require("../models/Vote");
const CryptoJS = require("crypto-js");
// ==========================
// Admin Middleware
// ==========================
function isAdmin(req, res, next) {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return res.send("❌ Access Denied");
    }

    next();

}

console.log("✅ voteRoutes Loaded");

// ==========================
// Voting Page
// ==========================
router.get("/vote", async (req, res) => {

    try {

        if (!req.session.user) {
            return res.redirect("/login");
        }

        const candidates = await Candidate.find();

        res.render("vote", {
            user: req.session.user,
            candidates
        });

    } catch (error) {

        console.log(error);
        res.send("Error Loading Vote Page");

    }

});

// ==========================
// Admin Dashboard
// ==========================
router.get("/admin", isAdmin, async (req, res) => {

    try {

        if (!req.session.user) {
            return res.redirect("/login");
        }

        const candidates = await Candidate.find();

        const totalCandidates = await Candidate.countDocuments();

        const totalUsers = await User.countDocuments();

        const totalVotes = await Vote.countDocuments();

        const totalBlocks = await Vote.countDocuments();

        res.render("admin", {

            candidates,

            totalCandidates,

            totalUsers,

            totalVotes,

            totalBlocks

        });

    } catch (error) {

        console.log(error);

        res.send("Error Loading Admin Dashboard");

    }

});

// ==========================
// Add Candidate
// ==========================
router.post("/addCandidate", isAdmin, async (req, res) => {

    try {

        const { candidateName, partyName, symbol } = req.body;

        const candidate = new Candidate({
            candidateName,
            partyName,
            symbol
        });

        await candidate.save();

        res.redirect("/admin");

    } catch (error) {

        console.log(error);
        res.send("Error Adding Candidate");

    }

});

// ==========================
// Delete Candidate
// ==========================
router.post("/deleteCandidate/:id", isAdmin, async (req, res) => {

    try {

        await Candidate.findByIdAndDelete(req.params.id);

        res.redirect("/admin");

    } catch (error) {

        console.log(error);
        res.send("Error Deleting Candidate");

    }

});

// ==========================
// Edit Candidate Page
// ==========================
router.get("/editCandidate/:id", isAdmin, async (req, res) => {

    try {

        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.send("Candidate Not Found");
        }

        res.render("editCandidate", {
            candidate
        });

    } catch (error) {

        console.log(error);
        res.send("Error Loading Candidate");

    }

});

// ==========================
// Update Candidate
// ==========================
router.post("/editCandidate/:id", isAdmin, async (req, res) => {

    try {

        const { candidateName, partyName, symbol } = req.body;

        await Candidate.findByIdAndUpdate(req.params.id, {

            candidateName,
            partyName,
            symbol

        });

        res.redirect("/admin");

    } catch (error) {

        console.log(error);
        res.send("Error Updating Candidate");

    }

});

// ==========================
// Vote for Candidate
// ==========================
router.post("/vote/:id", async (req, res) => {

    try {

        if (!req.session.user) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.send("User not found.");
        }

        if (user.hasVoted) {
            return res.send("❌ You have already voted.");
        }

        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.send("Candidate not found.");
        }

        // Increase Vote Count
        candidate.totalVotes += 1;
        await candidate.save();

        // Mark User as Voted
        user.hasVoted = true;
        await user.save();

        req.session.user = user;

        // Blockchain
        const lastVote = await Vote.findOne().sort({ timestamp: -1 });

        const previousHash = lastVote
            ? lastVote.currentHash
            : "0";

        const data =
            user._id.toString() +
            candidate._id.toString() +
            Date.now().toString() +
            previousHash;

        const currentHash = CryptoJS
            .SHA256(data)
            .toString();

        const vote = new Vote({

            voterId: user._id,
            candidateId: candidate._id,
            previousHash,
            currentHash

        });

        await vote.save();

        res.redirect("/results");

    } catch (error) {

        console.log(error);
        res.send("Voting Failed");

    }

});

// ==========================
// Results Page
// ==========================
router.get("/results", isAdmin,async (req, res) => {

    try {

        const candidates = await Candidate.find().sort({ totalVotes: -1 });

        let winner = null;

        if (candidates.length > 0) {

            winner = candidates[0];

        }

        res.render("results", {

            candidates,
            winner

        });

    } catch (error) {

        console.log(error);

        res.send("Error Loading Results");

    }

});

// ==========================
// Blockchain Explorer
// ==========================
router.get("/blockchain", isAdmin,async (req, res) => {

    try {

        const blocks = await Vote.find()
            .populate("voterId")
            .populate("candidateId")
            .sort({ timestamp: 1 });

        res.render("blockchain", {
            blocks
        });

    } catch (error) {

        console.log(error);
        res.send("Error Loading Blockchain");

    }

});

// ==========================
// Verify Blockchain
// ==========================
router.get("/verify", isAdmin, async (req, res) => {

    try {

        const blocks = await Vote.find()
            .sort({ timestamp: 1 });

        let valid = true;

        for (let i = 1; i < blocks.length; i++) {

            if (blocks[i].previousHash !== blocks[i - 1].currentHash) {

                valid = false;
                break;

            }

        }

        res.render("verify", {
            valid
        });

    } catch (error) {

        console.log(error);
        res.send("Verification Failed");

    }

});

module.exports = router;