import nodemailer from "nodemailer";

type Notice = {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  files: string[];
};

export async function sendInquiryEmail(notice: Notice) {
  const host = process.env.SMTP_HOST;
  const to = process.env.INQUIRY_TO;
  if (!host || !to) return { sent: false as const };

  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  const lines = [
    `Name: ${notice.name}`,
    `Company: ${notice.company}`,
    `Phone: ${notice.phone}`,
    `Email: ${notice.email}`,
    notice.source ? `Source: ${notice.source}` : "",
    "",
    notice.message || "(no description)",
    "",
    notice.files.length
      ? `Files are stored in the CMS and are not attached: ${notice.files.join(", ")}`
      : "No files attached.",
  ].filter(Boolean);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    replyTo: notice.email,
    subject: `New Foster — ${notice.company}`,
    text: lines.join("\n"),
  });

  return { sent: true as const };
}
