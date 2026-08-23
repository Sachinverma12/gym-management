import express from "express";
import MembershipPlanConfig from "../models/membershipPlanConfig.model.js";
import User from "../models/user.model.js";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Get all membership plans
router.get("/", async (req, res) => {
  try {
    const plans = await MembershipPlanConfig.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Error fetching plans" });
  }
});

// Get a specific plan
router.get("/:id", async (req, res) => {
  try {
    const plan = await MembershipPlanConfig.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    console.error("Get plan error:", error);
    res.status(500).json({ message: "Error fetching plan" });
  }
});

// Create new membership plan (admin)
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Plan name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("duration").notEmpty().withMessage("Duration is required"),
    body("durationNum").isInt({ min: 1 }).withMessage("Duration number must be positive"),
    body("durationUnit").isIn(["month", "quarter", "year"]).withMessage("Invalid duration unit")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, description, price, duration, durationNum, durationUnit } = req.body;
      
      const plan = await MembershipPlanConfig.create({
        name,
        description,
        price,
        duration: `${durationNum} ${durationUnit}`,
        durationNum,
        durationUnit,
        isActive: true
      });
      
      res.status(201).json({
        message: "Membership plan created successfully",
        plan
      });
    } catch (error) {
      console.error("Create plan error:", error);
      res.status(500).json({ message: "Error creating membership plan" });
    }
  }
);

// Update membership plan
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid plan ID"),
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("duration").optional(),
    body("durationNum").optional().isInt({ min: 1 }),
    body("durationUnit").optional().isIn(["month", "quarter", "year"]),
    body("isActive").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { name, description, price, duration, durationNum, durationUnit, isActive } = req.body;
      
      const plan = await MembershipPlanConfig.findByIdAndUpdate(
        id,
        {
          ...(name && { name }),
          ...(description && { description }),
          ...(price && { price }),
          ...(duration && { duration }),
          ...(durationNum && { durationNum }),
          ...(durationUnit && { durationUnit }),
          ...(isActive !== undefined && { isActive })
        },
        { new: true }
      );
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      res.json({
        message: "Membership plan updated successfully",
        plan
      });
    } catch (error) {
      console.error("Update plan error:", error);
      res.status(500).json({ message: "Error updating membership plan" });
    }
  }
);

// Delete membership plan
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await MembershipPlanConfig.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    
    res.json({ message: "Membership plan deleted successfully" });
  } catch (error) {
    console.error("Delete plan error:", error);
    res.status(500).json({ message: "Error deleting membership plan" });
  }
});

export default router;