require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

console.log("RUNNING FROM:", __dirname);

console.log("SERVER STARTED AT:", new Date().toLocaleTimeString());

const app = express();

// Database Connection
require("./database/connection");

// Routes
const authRoutes = require("./routes/authRoutes");
const voteRoutes = require("./routes/voteRoutes");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: "votingSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 // 1 hour
        }
    })
);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", authRoutes);
app.use("/", voteRoutes);

app.post("/vote/:id", (req, res) => {
    res.send("SERVER POST ROUTE WORKING");
});

// Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// Register Page
app.get("/register", (req, res) => {
    res.render("register");
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});

// Dashboard
app.get("/dashboard", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("dashboard", {
        user: req.session.user
    });

});

app.get("/admin", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return res.send("❌ Access Denied! Admins Only.");
    }

    res.render("admin", {
        user: req.session.user
    });

});

// Logout
app.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/login");
    });

});

// Test Route
app.get("/test", (req, res) => {
    res.send("Test Route Working");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});