const mongoose = require("mongoose");
const NotificationLog = require("../models/NotificationLog");
const { sendMail } = require("../utils/emailUtils");

// Background Worker to process 15 emails at a time 
const processEmailQueue = async () => {
  try {
    const pendingEmails = await NotificationLog.find({ status: "PENDING" }).limit(15);

    if (pendingEmails.length === 0) {
      return;
    }

    console.log(`Found ${pendingEmails.length} pending emails. Processing...`);

    for (const emailLog of pendingEmails) {
      try {

        await sendMail(emailLog.recipientEmail, emailLog.subject, emailLog.content);
        
        emailLog.status = "DELIVERED";
        emailLog.deliveredAt = new Date();
        emailLog.attempts += 1;
        await emailLog.save();
        
      } catch (err) {
        console.error(`Failed to send email to ${emailLog.recipientEmail}:`, err.message);
        emailLog.status = "FAILED";
        emailLog.errorMessage = err.message;
        emailLog.attempts += 1;
        await emailLog.save();
      }
    }
    
    console.log(`Batch complete.`);
  } catch (error) {
    console.error("Email Queue processing error:", error);
  }
};

// Start the sending mail loop worker
const startEmailWorker = () => {
  console.log("Background Email Worker Started. Polling every 3 seconds...");
  setInterval(processEmailQueue, 3000);
};

module.exports = { startEmailWorker };
