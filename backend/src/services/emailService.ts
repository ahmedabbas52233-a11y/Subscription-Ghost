import nodemailer from 'nodemailer';

interface AlertPayload {
  to:    string;
  name:  string;
  sub:   string;
  price: number;
  days:  number;
  date:  string;
}

/* ── Transporter ─────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ── Email template ──────────────────────────────────────────── */
const buildHtml = ({ name, sub, price, days, date }: AlertPayload): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#060a14;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#0d1321;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
    <div style="background:linear-gradient(135deg,#00d4ff,#7c3aed);padding:28px 32px;text-align:center;">
      <div style="font-size:36px;">👻</div>
      <h1 style="margin:10px 0 4px;color:#fff;font-size:22px;font-weight:800;">SubscriptionGhost</h1>
      <p style="margin:0;color:rgba(255,255,255,0.75);font-size:13px;">Renewal Alert</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;">Hi ${name},</p>
      <div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:12px;padding:20px 22px;margin-bottom:24px;">
        <p style="margin:0 0 6px;color:#f87171;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">
          ${days === 1 ? '⚠️ Renewing tomorrow' : `🔔 Renewing in ${days} days`}
        </p>
        <p style="margin:0;color:#e2e8f0;font-size:20px;font-weight:800;">${sub}</p>
        <p style="margin:6px 0 0;color:#64748b;font-size:13px;">$${price}/month · ${date}</p>
      </div>
      <p style="color:#64748b;font-size:13.5px;line-height:1.6;margin:0 0 24px;">
        Make sure you have sufficient funds or take action before the renewal date.
        Log in to pause, cancel, or update this subscription.
      </p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}"
        style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
        Manage Subscriptions →
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="margin:0;color:#475569;font-size:11px;">
        You're receiving this because you have alerts enabled in SubscriptionGhost.<br>
        <a href="${process.env.CLIENT_URL}/settings" style="color:#00d4ff;">Manage notification settings</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

/* ── Send email ──────────────────────────────────────────────── */
export const sendRenewalAlert = async (payload: AlertPayload): Promise<void> => {
  const subject = payload.days === 1
    ? `⚠️ ${payload.sub} renews tomorrow — $${payload.price}`
    : `🔔 ${payload.sub} renews in ${payload.days} days — $${payload.price}`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || '"SubscriptionGhost" <noreply@subscriptionghost.com>',
    to:      payload.to,
    subject,
    html:    buildHtml(payload),
    text:    `Hi ${payload.name}, ${payload.sub} renews in ${payload.days} day(s) on ${payload.date} for $${payload.price}.`,
  });
};

/* ── Verify SMTP on startup ──────────────────────────────────── */
export const verifySmtp = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (err) {
    console.warn('⚠️  SMTP not configured — email alerts disabled');
  }
};
