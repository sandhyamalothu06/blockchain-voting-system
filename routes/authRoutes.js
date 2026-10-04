const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcrypt");

// ================= REGISTER =================

router.post("/register", async (req, res) => {

    try {

        const {
            fullName,
            aadhaarNumber,
            voterId,
            email,
            password
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email },
                { aadhaarNumber },
                { voterId }
            ]
        });

        if (existingUser) {
            return res.send("User already exists");
        }

        // Encrypt Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = new User({
            fullName,
            aadhaarNumber,
            voterId,
            email,
            password: hashedPassword,
            role: "voter"
        });

        await newUser.save();

        res.redirect("/login");

    } catch (error) {

        console.log(error);
        res.send("Registration Failed");

    }

});


// ================= LOGIN =================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Invalid Password");
        }

        // Create Session
        req.session.user = user;

        if (user.role === "admin") {

    res.redirect("/admin");

} else {

    res.redirect("/dashboard");

}

    } catch (error) {

        console.log(error);
        res.send("Login Failed");

    }

});

module.exports = router;