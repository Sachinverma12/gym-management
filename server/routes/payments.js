import express from "express";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Record a payment
router.post(
  "/",
  [
    body("userId").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid user ID"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("method").optional().isIn(["cash", "card", "bank_transfer", "upi", "netbanking"]),
    body("transactionId").optional().notEmpty().withMessage("Transaction ID is required"),
    body("notes").optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { userId, amount, method, transactionId, notes } = req.body;
      
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create payment record
      const payment = await Payment.create({
        userId,
        amount,
        method: method || "cash",
        transactionId,
        notes
      });
      
      // Update user's fee status
      // Check if all payments cover the membership
      const pendingPayments = await Payment.find({ userId, status: "PENDING" });
      
      // Calculate total paid
      const totalPaid = await Payment.aggregate([
        { $match: { userId, status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      
      // For simplicity, mark as paid if there's a payment
      user.feeStatus = "PAID";
      user.nextDueDate = calculateNextDueDate(user.membershipPlan);
      await user.save();
      
      res.status(201).json({
        message: "Payment recorded successfully",
        payment,
        userFeeStatus: user.feeStatus,
        userNextDueDate: user.nextDueDate
      });
    } catch (error) {
      console.error("Record payment error:", error);
      res.status(500).json({ message: "Error recording payment" });
    }
  }
);

// Get payment history for a user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const payments = await Payment.find({ userId })
      .sort({ paymentDate: -1 })
      .limit(50);
    
    res.json(payments);
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: "Error fetching payment history" });
  }
});

// Get all payments (admin)
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ paymentDate: -1 })
      .limit(100);
    
    res.json(payments);
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ message: "Error fetching payments" });
  }
});

// Manually mark payment as received
router.post(
  "/manual-mark/:id",
  [
    param("id").isMongoId().withMessage("Invalid payment ID"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("date").optional(),
    body("method").optional().isIn(["cash", "card", "bank_transfer", "upi", "netbanking"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { amount, date, method } = req.body;
      
      const payment = await Payment.findByIdAndUpdate(
        id,
        {
          ...(amount && { amount }),
          ...(date && { paymentDate: new Date(date) }),
          ...(method && { method }),
          status: "PAID"
        },
        { new: true }
      );
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Update user's fee status
      const user = await User.findById(payment.userId);
      if (user) {
        user.feeStatus = "PAID";
        user.nextDueDate = calculateNextDueDate(user.membershipPlan);
        await user.save();
      }
      
      res.json({
        message: "Payment marked as received successfully",
        payment,
        userFeeStatus: user ? user.feeStatus : null
      });
    } catch (error) {
      console.error("Manual mark payment error:", error);
      res.status(500).json({ message: "Error marking payment as received" });
    }
  }
);

function calculateNextDueDate(plan: string | null): Date | null {
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