import express from "express";
import User from "../models/user.model.js";
import MembershipPlanConfig from "../models/membershipPlanConfig.model.js";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Get all members (admin only)
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ message: "Error fetching members" });
  }
});

// Get member by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get member error:", error);
    res.status(500).json({ message: "Error fetching member" });
  }
});

// Search and filter members
router.get("/search", async (req, res) => {
  try {
    const { status, plan } = req.query;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let filter: any = {};
    /* eslint-enable @typescript-eslint/no-explicit-any */
    
    if (status) {
      filter.feeStatus = status;
    }
    
    if (plan) {
      filter.membershipPlan = plan;
    }
    
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error("Search members error:", error);
    res.status(500).json({ message: "Error searching members" });
  }
});

// Add new member
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required").isMobilePhone(),
    body("email").optional().isEmail(),
    body("membershipPlan").optional().isIn(["MONTHLY", "QUARTERLY", "YEARLY"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, phone, email, membershipPlan } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ phone }, { email }]
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "User with this phone or email already exists" });
      }
      
      // Create new user
      const user = await User.create({
        name,
        phone,
        email,
        role: "MEMBER",
        membershipPlan: membershipPlan || null,
        membershipStart: membershipPlan ? new Date() : null,
        membershipEnd: membershipPlan ? calculateMembershipEnd(membershipPlan) : null,
        feeStatus: "PENDING",
        nextDueDate: membershipPlan ? calculateDueDate(membershipPlan) : null
      });
      
      res.status(201).json({
        message: "Member added successfully",
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
      console.error("Add member error:", error);
      res.status(500).json({ message: "Error adding member" });
    }
  }
);

// Edit member
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid member ID"),
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().notEmpty().withMessage("Phone cannot be empty").isMobilePhone(),
    body("membershipPlan").optional().isIn(["MONTHLY", "QUARTERLY", "YEARLY"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { name, phone, email, membershipPlan } = req.body;
      
      // Check if member exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      // Check if new phone/email already exists (excluding current user)
      if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
          return res.status(400).json({ message: "Phone number already exists" });
        }
      }
      
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Update user fields
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (email) user.email = email;
      if (membershipPlan) {
        user.membershipPlan = membershipPlan;
        user.membershipStart = user.membershipStart || new Date();
        user.membershipEnd = calculateMembershipEnd(membershipPlan);
        user.feeStatus = "PENDING";
        user.nextDueDate = calculateDueDate(membershipPlan);
      }
      
      await user.save();
      
      res.json({
        message: "Member updated successfully",
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
      console.error("Edit member error:", error);
      res.status(500).json({ message: "Error updating member" });
    }
  }
);

// Delete member
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Member not found" });
    }
    
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Delete member error:", error);
    res.status(500).json({ message: "Error deleting member" });
  }
});

// Calculate membership end date
function calculateMembershipEnd(plan: string): Date {
  const start = new Date();
  switch (plan) {
    case "MONTHLY":
      return new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
    case "QUARTERLY":
      return new Date(start.getFullYear(), start.getMonth() + 3, start.getDate());
    case "YEARLY":
      return new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
    default:
      return new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
  }
}

// Calculate due date
function calculateDueDate(plan: string): Date | null {
  if (!plan) return null;
  const now = new Date();
  switch (plan) {
    case "MONTHLY":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case "QUARTERLY":
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case "YEARLY":
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}

export default router;