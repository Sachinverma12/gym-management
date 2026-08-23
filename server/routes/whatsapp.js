const express = require("express");
const router = express.Router();
const { client } = require("../services/whatsapp.bot.js");

// ✅ Get QR Status & Bot Info
router.get("/qr-status", async (req, res) => {
  try {
    if (client.info && client.info.wid) {
      // Bot is connected
      res.json({
        status: "connected",
        phone: client.info.wid._serialized,
        message: "WhatsApp bot is active and connected",
      });
    } else if (client._events && client._events.qr) {
      // QR code is displayed, waiting for scan
      res.json({
        status: "qr_displayed",
        message: "Scan the QR code with your WhatsApp to connect",
      });
    } else {
      res.json({
        status: "initializing",
        message: "WhatsApp bot is initializing...",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Reset/Reconnect WhatsApp Bot
router.post("/reset", async (req, res) => {
  try {
    client.destroy();
    client.initialize();
    res.json({
      status: "reset",
      message: "WhatsApp bot reset. Scan new QR code to connect.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Handle Incoming WhatsApp Messages (Webhook)
router.post("/", async (req, res) => {
  try {
    const { From, Body } = req.body;
    const phoneNumber = From.replace("whatsapp:", "");

    // TODO: Look up user in your gym database
    // const user = await fetchUserByPhone(phoneNumber);

    // Simple echo/responder for webhook
    if (Body && Body.toLowerCase().trim() === "balance") {
      // await client.sendMessage(
      //   `${phoneNumber}@c`,
      //   `Your fee status: PENDING, Next Due: Jan 25, 2025`
      // );
      res.json({ status: "balance_shown" });
    } else if (Body && Body.toLowerCase().trim() === "help") {
      // await client.sendMessage(
      //   `${phoneNumber}@c`,
      //   `Commands: "balance", "status", "history", "help"`
      // );
      res.json({ status: "help_shown" });
    } else {
      // await client.sendMessage(
      //   `${phoneNumber}@c`,
      //   `Thanks for messaging! Reply "help" for available commands.`
      // );
      res.json({ status: "echo", message: "Thanks for messaging!" });
    }

    res.status(200).send(); // WhatsApp expects 200 OK
  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error);
    res.status(200).send(); // Always return 200 to WhatsApp
  }
});

// ✅ Test: Send Manual Welcome Message
router.post("/test-welcome", async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (phone && name) {
      // await client.sendMessage(`${phone}@c`, `Welcome ${name}!`);
      res.json({ status: "sent", message: "Welcome message would be sent" });
    } else {
      res.status(400).json({ error: "phone and name required" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;