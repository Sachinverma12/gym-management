import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    // Validate required fields
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone or email already exists" });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: "MEMBER",
      membershipPlan: null,
      membershipStart: null,
      membershipEnd: null,
      feeStatus: "PENDING",
      nextDueDate: null
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "gym-secret-key",
      { expiresIn: "7d" }
    );
    
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error during signup" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }
    
    // Find user by phone
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "gym-secret-key",
      { expiresIn: "7d" }
    );
    
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        membershipPlan: user.membershipPlan,
        feeStatus: user.feeStatus,
        nextDueDate: user.nextDueDate
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Verify token middleware
/* eslint-disable @typescript-eslint/no-explicit-any */
router.use(
  "/",
  async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token required" });
      }
      
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "gym-secret-key");
      
      // Attach user to request
      req.user = await User.findById(decoded.userId);
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
/* eslint-enable @typescript-eslint/no-explicit-any */
);

export default router;