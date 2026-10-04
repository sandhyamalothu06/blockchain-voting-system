const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({

    candidateName: {
        type: String,
        required: true
    },

    partyName: {
        type: String,
        required: true
    },

    totalVotes: {
        type: Number,
        default: 0
    }

});

module.exports = mongoose.model("Candidate", candidateSchema);