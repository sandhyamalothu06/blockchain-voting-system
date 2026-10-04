const User = require("../models/User");
const bcrypt = require("bcrypt");

// ======================
// Register User
// ======================
exports.register = async (req, res) => {
    try {
        const { fullName, aadhaarNumber, voterId, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("Email already registered!");
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = new User({
            fullName,
            aadhaarNumber,
            voterId,
            email,
            password: hashedPassword,
        });

        await user.save();

        res.send("Registration Successful!");
    } catch (error) {
        console.log(error);
        res.send("Registration Failed");
    }
};

// ======================
// Login User
// ======================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User not found!");
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Incorrect Password!");
        }

        // Store Session
        req.session.userId = user._id;
        req.session.role = user.role;

        res.send("Login Successful!");
    } catch (error) {
        console.log(error);
        res.send("Login Failed");
    }
};
