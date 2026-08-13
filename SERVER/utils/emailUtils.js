require("dotenv").config();

const sendMail = async (to, subject, html) => {
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
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to send email via Brevo API",
      );
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Brevo Email Error:", err);
    throw new Error(err.message);
  }
};

module.exports = { sendMail };
