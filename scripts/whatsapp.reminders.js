const cron = require("node-cron");
const {
  client,
  sendReminder3Days,
  sendOverdueAlert
} = require("./services/whatsapp.bot.js");
const User = require("./models/user.model.js");

// ✅ Run daily at 9 AM to send 3-day fee reminders
cron.schedule("0 9 * * *", async () => {
  console.log("🕐 Running daily 3-day fee reminder check...");
  
  // Find members with fee due in next 3 days
  const members = await User.find({
    feeStatus: "PENDING",
    nextDueDate: { 
      $gte: new Date(),
      $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
    }
  });
  
  for (const member of members) {
    await sendReminder3Days(
      member._id,
      member.name,
      member.nextDueDate
    );
  }
  
  console.log(`✅ Sent ${members.length} 3-day reminders`);
});

// ✅ Run daily at 10 AM for overdue alerts
cron.schedule("0 10 * * *", async () => {
  console.log("🕐 Running daily overdue alert check...");
  
  // Find members with OVERDUE status whose membership end date has passed
  const today = new Date();
  const members = await User.find({
    feeStatus: "OVERDUE",
    membershipEnd: { $lt: today }
  });
  
  for (const member of members) {
    // Calculate days overdue
    const daysOverdue = Math.floor(
      (today - member.membershipEnd) / (1000 * 60 * 60 * 24)
    );
    
    // Ensure at least 1 day
    const days = daysOverdue > 0 ? daysOverdue : 1;
    
    await sendOverdueAlert(
      member._id,
      member.name,
      days
    );
  }
  
  console.log(`✅ Sent ${members.length} overdue alerts`);
});

// ✅ Weekly: Send attendance confirmations to active members
cron.schedule("0 18 * * 1", async () => {
  console.log("🕐 Weekly attendance confirmation batch...");
  
  // Get members who checked in this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const checkIns = await Attendance.find({
    checkInAt: { $gte: weekAgo },
    status: "CHECKED_IN"
  })
  .populate("userId", "name phone")
  .limit(50); // Limit to first 50 to avoid message spam
  
  let sent = 0;
  for (const attendance of checkIns) {
    const user = attendance.userId;
    if (user) {
      const duration = Math.round(
        (new Date() - new Date(attendance.checkInAt)) / 60000
      );
      
      await sendAttendanceConfirmation(
        user._id,
        user.name,
        attendance.checkInAt,
        attendance.checkOutAt || new Date(),
        duration
      );
      sent++;
    }
  }
  
  console.log(`✅ Sent ${sent} weekly attendance confirmations`);
});

// ✅ Monthly: Send membership renewal remindals (1 week before expiry)
cron.schedule("0 9 28 * *", async () => {
  console.log("🕐 Monthly membership renewal reminder...");
  
  // Get members whose membership expires this month
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  const members = await User.find({
    membershipEnd: {
      $gte: now,
      $lt: nextMonth
    }
  });
  
  for (const member of members) {
    const daysUntilExpiry = Math.ceil(
      (member.membershipEnd - now) / (1000 * 60 * 60 * 24)
    );
    
    await sendReminder3Days(
      member._id,
      member.name,
      member.membershipEnd
    );
    // Override message to be renewal-focused
    // Note: sendReminder3Days uses generic text, could enhance later
  }
  
  console.log(`✅ Monthly renewal reminders sent to ${members.length} members`);
});

console.log("⏰ WhatsApp Reminders Cron Jobs Initialized");