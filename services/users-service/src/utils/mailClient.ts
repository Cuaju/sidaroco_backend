const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL || "http://localhost:3001";

export async function sendVerificationEmail(email: string, code: string) {
  const res = await fetch(`${MAIL_SERVICE_URL}/mail/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: email,
      subject: "Sidaroco - Verify your email",
      template: "verify-email",
      context: {
        code,
        // appName: "Sidaroco",
        // supportEmail: "support@sidaroco.com",
      },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "mail service error");
  }
}
