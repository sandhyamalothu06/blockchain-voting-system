const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        
    },

    aadhaarNumber: {
        type: String,
        required: true,
        unique: true
    },

    voterId: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    hasVoted: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        default: "voter"
    },

    hasVoted: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model("User", userSchema);