require("dotenv").config();

const sendMail = async (to, subject, html) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured in server environment");
  }
  if (!process.env.BREVO_FROM_EMAIL) {
    throw new Error("BREVO_FROM_EMAIL is not configured in server environment");
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_FROM_EMAIL,
          name: "CampusBridge System",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: Failed to send email via Brevo API`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.code || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Brevo Email Error:", err.message);
    throw new Error(err.message);
  }
};

module.exports = { sendMail };
