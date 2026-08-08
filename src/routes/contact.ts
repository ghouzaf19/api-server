import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address." });
    return;
  }

  if (message.trim().length < 10) {
    res.status(400).json({ error: "Message is too short." });
    return;
  }

  const transporter = createTransport();

  if (!transporter) {
    req.log.warn("SMTP not configured — contact form submission logged only");
    req.log.info(
      { name, email, messageLength: message.length },
      "Contact form submission (SMTP not configured)"
    );
    res.status(202).json({
      ok: true,
      warning: "SMTP not configured. Message logged but not emailed.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Meat Lovers Hub Contact" <${process.env.SMTP_USER}>`,
      replyTo: `"${name}" <${email}>`,
      to: "contact@meatlovershub.com",
      subject: `New contact message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #111; border-bottom: 2px solid #ff4d4d; padding-bottom: 12px;">
            New Contact Message — Meat Lovers Hub
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 80px;">Name</td>
              <td style="padding: 8px 12px; color: #111;">${name}</td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
              <td style="padding: 8px 12px;">
                <a href="mailto:${email}" style="color: #ff4d4d;">${email}</a>
              </td>
            </tr>
          </table>
          <div style="background: #fff; border-left: 4px solid #ff4d4d; padding: 16px 20px; border-radius: 4px;">
            <p style="font-weight: bold; color: #555; margin: 0 0 8px;">Message</p>
            <p style="color: #111; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    req.log.info({ name, email }, "Contact form email sent successfully");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send contact form email");
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
});

export default router;
