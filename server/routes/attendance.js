import express from "express";
import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import twilio from "twilio";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Check in (scan QR code)
router.post(
  "/check-in",
  async (req, res) => {
    try {
      const { userId, branchId, userAgent, ip } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check for duplicate check-in today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const existingCheckIn = await Attendance.findOne({
        userId,
        checkInAt: {
          $gte: todayStart,
          $lte: todayEnd
        },
        status: "CHECKED_IN"
      });
      
      if (existingCheckIn) {
        return res.status(400).json({ 
          message: "Already checked in today. Please check out first.",
          existingCheckIn
        });
      }
      
      // Create new attendance record
      const attendance = await Attendance.create({
        userId,
        branchId: branchId || "default-branch",
        checkInIp: ip,
        checkInUserAgent: userAgent,
        status: "CHECKED_IN"
      });
      
      // Update user's last check-in and attendance count
      user.lastCheckIn = new Date();
      user.attendanceCountThisMonth = (user.attendanceCountThisMonth || 0) + 1;
      await user.save();
      
      // Send WhatsApp attendance confirmation (optional)
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
        try {
          const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          
          const message = await client.messages.create({
            body: `🏋️‍♂️ Attendance Confirmation\n\nYou have successfully checked in at the gym!\n\nAttendance count this month: ${user.attendanceCountThisMonth}`,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${user.phone}`
          });
          
          // Update attendance record with WhatsApp message ID
          attendance.whatsappSent = true;
          attendance.whatsappMessageId = message.sid;
          await attendance.save();
        } catch (whatsappError) {
          console.error("WhatsApp send error:", whatsappError);
          // Continue without failing the check-in
        }
      }
      
      res.json({
        message: "Check-in successful",
        attendance: {
          id: attendance._id,
          checkInAt: attendance.checkInAt,
          branchId: attendance.branchId,
          status: attendance.status
        },
        attendanceCount: user.attendanceCountThisMonth
      });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({ message: "Error during check-in" });
    }
  }
);

// Check out
router.post(
  "/check-out",
  async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Find the most recent unchecked-out attendance record for today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const attendance = await Attendance.findOneAndUpdate(
        {
          userId,
          checkInAt: {
            $gte: todayStart,
            $lte: todayEnd
          },
          status: "CHECKED_IN"
        },
        {
          checkOutAt: new Date(),
          status: "CHECKED_OUT"
        },
        { new: true }
      );
      
      if (!attendance) {
        return res.status(404).json({ message: "No active check-in found for today" });
      }
      
      const timeSpent = attendance.checkOutAt && attendance.checkInAt 
        ? Math.round((attendance.checkOutAt.getTime() - attendance.checkInAt.getTime()) / 60000) 
        : 0;
      
      // Send WhatsApp check-out confirmation (optional)
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
        try {
          const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          
          const message = await client.messages.create({
            body: `🏋️‍♂️ Check-out Complete\n\nYour gym session lasted ${timeSpent} minutes.\n\nTotal check-ins this month: ${user.attendanceCountThisMonth}`,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${user.phone}`
          });
          
          // Update attendance record with WhatsApp message ID
          attendance.whatsappSent = true;
          attendance.whatsappMessageId = message.sid;
          await attendance.save();
        } catch (whatsappError) {
          console.error("WhatsApp send error:", whatsappError);
          // Continue without failing the check-out
        }
      }
      
      res.json({
        message: "Check-out successful",
        attendance: {
          id: attendance._id,
          checkInAt: attendance.checkInAt,
          checkOutAt: attendance.checkOutAt,
          timeSpentMinutes: timeSpent,
          status: attendance.status
        }
      });
    } catch (error) {
      console.error("Check-out error:", error);
      res.status(500).json({ message: "Error during check-out" });
    }
  }
);

// Get attendance history for a user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const attendanceRecords = await Attendance.find({ userId })
      .sort({ checkInAt: -1 })
      .limit(50);
    
    res.json(attendanceRecords);
  } catch (error) {
    console.error("Get attendance history error:", error);
    res.status(500).json({ message: "Error fetching attendance history" });
  }
});

// Get monthly attendance count
router.get("/monthly-count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      attendanceCountThisMonth: user.attendanceCountThisMonth || 0
    });
  } catch (error) {
    console.error("Get monthly count error:", error);
    res.status(500).json({ message: "Error fetching monthly count" });
  }
});

export default router;