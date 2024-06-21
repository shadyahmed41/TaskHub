const Admin = require("../models/adminmodel");
const Analysis = require("../models/analysismodel");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = new Admin({
            username,
            password
        });
        await admin.save();
        res.status(200).json({ success: true, message: "Admin registered successfully" });
    }
    catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send("Failed to register admin");
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username: username }).select(
            "+password"
          );
        if (!admin) {
            return res.status(200).json({ success: false, message: "Admin not found" });
        } else if (await bcrypt.compare(password, admin.password)) {
            const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 24 hours from now
            const AdminToken = jwt.sign({ username: username, exp: Math.floor(tokenExpiration.getTime() / 1000) }, process.env.TOKEN_SECRET);
            res.status(200).json({ success: true, AdminToken: AdminToken, message: "Admin logged successfully" });
        } else {
            res.status(200).json({ success: false, message: "Admin password is wrong" });
        }
    }
    catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send("Failed to login admin");
    }
};

exports.getAnalysis = async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.admin.username});
        if (!admin) return res.status(500).send("Failed to get analysis");
        const analysis = await Analysis.findOne();
        const projectProgress =
        {'Completed Projects': analysis.completedProjects ,
        'Not Completed Projects': analysis.activeProjects - analysis.completedProjects, };
        res.status(200).json({ success: true, analysis, projectProgress });
    } 
    catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send("Failed to get analysis");
    }
};