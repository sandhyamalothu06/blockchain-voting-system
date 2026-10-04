const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({

    voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true
    },

    previousHash: {
        type: String,
        default: "0"
    },

    currentHash: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Vote", voteSchema);