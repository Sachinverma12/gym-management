const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

// Initialize WhatsApp Client with local auth persistence
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./whatsapp-auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// ✅ Event: QR Code displayed
client.on("qr", async (qr) => {
  try {
    const qrCodeData = await qrcode.generate(qr, { small: true });
    console.log("📱 WhatsApp QR Code Generated - scan with phone");
  } catch (error) {
    console.error("❌ QR code generation error:", error.message);
  }
});

// ✅ Event: Bot is ready and connected
client.on("ready", async () => {
  console.log("🟢 WhatsApp Bot is online and ready!");
  // Could send broadcast welcome messages to all members here
});

// ✅ Event: Handle Incoming Messages from Members
client.on("message", async (message) => {
  const { from, body, isGroup, groupMsg } = message;

  // Skip group messages
  if (isGroup || groupMsg) return;

  // Look up user in your gym database
  const User = require("./models/user.model.js").default;
  const user = await User.findOne({ phone: from.replace("@c", "").replace("whatsapp:", "") });

  if (!user) {
    // Send error message if user not found
    await message.reply(
      "❌ We couldn't find your gym account. Please verify your phone number or visit the gym for registration."
    );
    return;
  }

  // ✅ Handle Keywords
  const lowerBody = body.toLowerCase().trim();

  // 1. "balance" or "due" - Check fee status
  if (lowerBody === "balance" || lowerBody === "due") {
    const dueDate = user.nextDueDate
      ? new Date(user.nextDueDate).toLocaleDateString()
      : "N/A";
    await message.reply(
      `💳 Your Fee Status: ${user.feeStatus}\n` +
      `📅 Next Due Date: ${dueDate}\n` +
      `💰 Membership Plan: ${user.membershipPlan || "None"}\n\n` +
      `Reply "pay" to make a payment or visit the gym office.`
    );
    return;
  }

  // 2. "status" or "checkin" - Last check-in info
  if (lowerBody === "status" || lowerBody === "checkin") {
    const lastAttendance = await Attendance.findOne({
      userId: user._id,
      status: "CHECKED_IN",
    })
      .sort({ checkInAt: -1 })
      .limit(1);

    if (lastAttendance) {
      const checkInTime = new Date(lastAttendance.checkInAt).toLocaleString();
      const minutesInside = Math.round(
        (new Date() - new Date(lastAttendance.checkInAt)) / 60000
      );
      await message.reply(
        `📊 Your Last Check-In: ${checkInTime}\n` +
        `⏱️ Minutes Still Inside: ${minutesInside}\n\n` +
        `Reply "checkout" to manually check out or "history" for full attendance.`
      );
    } else {
      await message.reply(
        "🚫 You haven't checked in yet. Visit the gym and scan the QR code at the entrance to log your first attendance!"
      );
    }
    return;
  }

  // 3. "history" - Attendance history
  if (lowerBody === "history") {
    const attendanceRecords = await Attendance.find({ userId: user._id })
      .sort({ checkInAt: -1 })
      .limit(10);

    if (attendanceRecords.length === 0) {
      await message.reply("📭 No attendance records found. Your first check-in is waiting!");
      return;
    }

    let historyText = "📅 Your Attendance History (Last 10):\n\n";
    attendanceRecords.forEach((record, index) => {
      const checkIn = new Date(record.checkInAt).toLocaleString();
      const checkOut = record.checkOutAt
        ? new Date(record.checkOutAt).toLocaleString()
        : "Still checked in";
      const duration = record.checkOutAt
        ? Math.round((record.checkOutAt - record.checkInAt) / 60000) + " min"
        : "Active";
      historyText += `${index + 1}. ${checkIn} - ${checkOut} (${duration})\n`;
    });

    await message.reply(historyText);
    return;
  }

  // 4. "help" - Show available commands
  if (lowerBody === "help") {
    await message.reply(
      `🤖 Gym WhatsApp Bot Commands:\n\n` +
      `• "balance" - Check fee status and due date\n` +
      `• "status" - Last gym check-in time\n` +
      `• "history" - Your attendance history\n` +
      `• "pay" - Make a payment (redirect to payment link)\n` +
      `• "welcome" - Resend welcome message\n\n` +
      `📍 Visit the gym or scan the QR code at the entrance for attendance.`
    );
    return;
  }

  // 5. "welcome" - Resend welcome message
  if (lowerBody === "welcome") {
    await sendWelcomeMessage(user.phone, user.name);
    await message.reply("✅ Welcome message has been resent to your WhatsApp!");
    return;
  }

  // 6. "pay" - Payment redirect
  if (lowerBody === "pay") {
    const paymentLink = `${process.env.FRONTEND_URL}/payment?user=${user._id}`;
    await message.reply(
      `💳 To pay your gym fee, visit:\n${paymentLink}\n\n` +
      `Or reply with payment details (amount, method) and we'll record it manually.`
    );
    return;
  }

  // Default: Unknown command
  await message.reply(
    "🤖 I didn't understand that command. Reply \"help\" to see available options."
  );
});

// ✅ Function: Send Welcome Message to New Member
async function sendWelcomeMessage(phone, name) {
  const welcomeText = `🏋️ Welcome to FitFlex Gym, ${name}! Your membership is active. 🎉\n\n` +
    `📍 Visit the gym and scan the QR code at the entrance to log attendance instantly.\n` +
    `💬 Reply "balance" to check your fee status.\n` +
    `💬 Reply "history" to view your attendance history.\n\n` +
    `🕒 Membership starts today. We're excited to have you!`;

  try {
    await client.sendMessage(`${phone}@c`, welcomeText);
    console.log(`✅ Welcome message sent to ${name} (${phone})`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send welcome:", error.message);
    // Don't throw - welcome failure shouldn't break member creation
    return false;
  }
}

// ✅ Function: Send Attendance Confirmation After Check-out
async function sendAttendanceConfirmation(userId, name, checkIn, checkOut, durationMinutes) {
  const user = await User.findById(userId);
  if (!user) return false;

  const attendanceText = `✅ Attendance Confirmed, ${name}! 🎉\n\n` +
    `🕐 Check-In: ${new Date(checkIn).toLocaleString()}\n` +
    `🕐 Check-Out: ${new Date(checkOut).toLocaleString()}\n` +
    `⏱️ Time Spent: ${durationMinutes} minutes\n\n` +
    `Keep up the great work! See you again soon at FitFlex Gym.`;

  try {
    await client.sendMessage(`${user.phone}@c`, attendanceText);
    console.log(`✅ Attendance confirmation sent to ${name}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send attendance confirmation:", error.message);
    return false;
  }
}

// ✅ Function: Send 3-Day Fee Reminder
async function sendReminder3Days(userId, name, dueDate) {
  const user = await User.findById(userId);
  if (!user) return false;

  const reminderText = `⏰ Reminder: Your gym fee is due in 3 days (${new Date(dueDate).toLocaleDateString()}).\n\n` +
    `💳 Current Status: ${user.feeStatus}\n` +
    `📅 Membership Plan: ${user.membershipPlan || "None"}\n\n` +
    `💳 To pay now: ${process.env.FRONTEND_URL}/payment?user=${user._id}\n\n` +
    `📞 Reply "balance" to check your current status.`;

  try {
    await client.sendMessage(`${user.phone}@c`, reminderText);
    console.log(`✅ 3-day reminder sent to ${name}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send reminder:", error.message);
    return false;
  }
}

// ✅ Function: Send Overdue Alert
async function sendOverdueAlert(userId, name, daysOverdue) {
  const user = await User.findById(userId);
  if (!user) return false;

  const overdueText = `⚠️ Overdue Alert, ${name}! 🚨\n\n` +
    `Your gym fee is ${daysOverdue} day(s) overdue.\n` +
    `Current Status: ${user.feeStatus}\n` +
    `📅 Next Action: Please complete payment immediately to avoid membership suspension.\n\n` +
    `💳 To pay now: ${process.env.FRONTEND_URL}/payment?user=${user._id}\n\n` +
    `📞 Reply "balance" to check your current status or call the gym office.`;

  try {
    await client.sendMessage(`${user.phone}@c`, overdueText);
    console.log(`✅ Overdue alert sent to ${name} (${daysOverdue} days overdue)`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send overdue alert:", error.message);
    return false;
  }
}

// ✅ Initialize and Connect WhatsApp Bot
client.initialize();

// Export all functions for use in other files
module.exports = {
  client,
  sendWelcomeMessage,
  sendAttendanceConfirmation,
  sendReminder3Days,
  sendOverdueAlert,
};