// Email notification service — sends lead notifications to DCS team
// and confirmation emails to users via Resend SDK.

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DCS_TEAM_EMAIL = process.env.DCS_TEAM_EMAIL || "jtalavera@distinctcsolutions.com";
const DCS_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via Resend SDK. 
 * Returns detailed result object for debugging.
 */
async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  console.log(`[EMAIL] Attempting to send email to: ${payload.to}`);
  console.log(`[EMAIL] Subject: ${payload.subject}`);
  console.log(`[EMAIL] From: ${DCS_FROM_EMAIL}`);
  console.log(`[EMAIL] Resend client initialized: ${!!resend}`);

  if (!resend) {
    console.warn(`[EMAIL] WARNING: RESEND_API_KEY not configured - email NOT sent`);
    return { 
      success: false, 
      error: "RESEND_API_KEY not configured" 
    };
  }

  try {
    console.log(`[EMAIL] Sending via Resend SDK...`);

    const { data, error } = await resend.emails.send({
      from: DCS_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error(`[EMAIL] FAILED to send to ${payload.to}:`, error);
      return { 
        success: false, 
        error: `Resend error: ${error.message}` 
      };
    }

    console.log(`[EMAIL] SUCCESS - Email sent to ${payload.to}, messageId: ${data?.id || "unknown"}`);
    return { 
      success: true, 
      messageId: data?.id 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[EMAIL] EXCEPTION while sending email:`, error);
    return { 
      success: false, 
      error: `Exception: ${errorMessage}` 
    };
  }
}

// ─── Public Notification Functions ───

/**
 * Notify the DCS team about a new Build Your ADU lead
 * Subject: "New Build Your ADU Lead"
 * Sent to: jtalavera@distinctcsolutions.com
 */
export async function notifyTeamADULead(lead: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  timestamp: string;
  source: string;
  verification?: {
    emailValidated: boolean;
    emailScore: number;
    emailIsDisposable: boolean;
    phoneVerified: boolean;
    verificationCompletedAt: string | null;
  };
}): Promise<EmailResult> {
  console.log(`[EMAIL] notifyTeamADULead called with:`, JSON.stringify(lead, null, 2));
  const formattedDate = new Date(lead.timestamp).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  // Verification status badges
  const v = lead.verification;
  const emailBadge = v?.emailValidated 
    ? `<span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Verified (Score: ${v.emailScore})</span>`
    : `<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Not Verified</span>`;
  const phoneBadge = v?.phoneVerified
    ? `<span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">SMS Verified</span>`
    : `<span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Not Verified</span>`;
  const disposableBadge = v?.emailIsDisposable
    ? `<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Disposable</span>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B2D4F; padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #C8A951; margin: 0; font-size: 20px;">New Build Your ADU Lead</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">First Name:</td>
            <td style="padding: 8px 0; color: #555;">${lead.firstName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Last Name:</td>
            <td style="padding: 8px 0; color: #555;">${lead.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
            <td style="padding: 8px 0; color: #555;"><a href="mailto:${lead.email}">${lead.email}</a> ${emailBadge} ${disposableBadge}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td>
            <td style="padding: 8px 0; color: #555;"><a href="tel:${lead.phone}">${lead.phone}</a> ${phoneBadge}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Property Address:</td>
            <td style="padding: 8px 0; color: #555;">${lead.propertyAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Timestamp:</td>
            <td style="padding: 8px 0; color: #555;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Source:</td>
            <td style="padding: 8px 0; color: #555;">${lead.source}</td>
          </tr>
        </table>
        
        ${v ? `
        <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #0369a1; font-size: 13px;">Verification Status</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 4px 0; color: #555;">Email Validated:</td>
              <td style="padding: 4px 0; color: #333;">${v.emailValidated ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #555;">Email Quality Score:</td>
              <td style="padding: 4px 0; color: #333;">${v.emailScore}/100</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #555;">Disposable Email:</td>
              <td style="padding: 4px 0; color: ${v.emailIsDisposable ? "#ef4444" : "#333"};">${v.emailIsDisposable ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #555;">Phone Verified (SMS):</td>
              <td style="padding: 4px 0; color: #333;">${v.phoneVerified ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #555;">Verified At:</td>
              <td style="padding: 4px 0; color: #333;">${v.verificationCompletedAt ? new Date(v.verificationCompletedAt).toLocaleString() : "N/A"}</td>
            </tr>
          </table>
        </div>
        ` : ""}
        
        <div style="margin-top: 20px; padding: 12px; background: #fff3cd; border-radius: 8px; font-size: 13px; color: #856404;">
          Follow up within 24 hours for best conversion.
        </div>
      </div>
    </div>
  `;

  const result = await sendEmail({
    to: DCS_TEAM_EMAIL,
    subject: "New Build Your ADU Lead",
    html,
  });
  
  console.log(`[EMAIL] notifyTeamADULead result:`, JSON.stringify(result));
  return result;
}

/**
 * Notify the DCS team about a new property report lead (legacy function)
 */
export async function notifyTeamNewLead(lead: {
  name: string;
  email: string;
  phone?: string | null;
  propertyAddress: string;
  source: string;
  confidenceScore?: number;
  recommendedPath?: string;
}): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B2D4F; padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #C8A951; margin: 0; font-size: 20px;">New Lead — Property Scanner</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td>
            <td style="padding: 8px 0; color: #555;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
            <td style="padding: 8px 0; color: #555;"><a href="mailto:${lead.email}">${lead.email}</a></td>
          </tr>
          ${lead.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td><td style="padding: 8px 0; color: #555;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Property:</td>
            <td style="padding: 8px 0; color: #555;">${lead.propertyAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Source:</td>
            <td style="padding: 8px 0; color: #555;">${lead.source}</td>
          </tr>
          ${lead.confidenceScore !== undefined ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Confidence:</td><td style="padding: 8px 0; color: #555;">${lead.confidenceScore}%</td></tr>` : ""}
          ${lead.recommendedPath ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Recommended:</td><td style="padding: 8px 0; color: #555;">${lead.recommendedPath}</td></tr>` : ""}
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #fff3cd; border-radius: 8px; font-size: 13px; color: #856404;">
          Follow up within 24 hours for best conversion.
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: DCS_TEAM_EMAIL,
    subject: `New Lead: ${lead.name} — ${lead.propertyAddress}`,
    html,
  });
}

/**
 * Send a confirmation email to the user after they request a property report
 */
export async function sendUserConfirmation(user: {
  name: string;
  email: string;
  propertyAddress: string;
}): Promise<EmailResult> {
  console.log(`[EMAIL] sendUserConfirmation called for: ${user.email}`);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B2D4F; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #C8A951; margin: 0; font-size: 22px;">Distinct Construction Solutions</h1>
        <p style="color: #ffffff99; margin: 4px 0 0; font-size: 13px;">Your Property Report</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e5e5;">
        <p style="color: #333; font-size: 15px;">Hi ${user.name},</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Thank you for scanning <strong>${user.propertyAddress}</strong> with our Property Intelligence Scanner.
          Your personalized Property Development Report has been generated.
        </p>
        <div style="background: #f0f7ff; border-left: 4px solid #C8A951; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: #333; font-weight: bold;">What happens next?</p>
          <ul style="margin: 8px 0 0; padding-left: 20px; color: #555; font-size: 13px; line-height: 1.8;">
            <li>A DCS specialist will review your property details</li>
            <li>We'll reach out within 24 hours to discuss your options</li>
            <li>Schedule a free on-site property assessment at your convenience</li>
          </ul>
        </div>
        <p style="color: #555; font-size: 14px;">
          Questions? Call us at <a href="tel:+18588330705" style="color: #1B2D4F; font-weight: bold;">(858) 833-0705</a>
          or reply to this email.
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e5e5; border-top: none;">
        <p style="margin: 0; font-size: 11px; color: #999;">
          Distinct Construction Solutions | Chula Vista, CA | Serving all of San Diego County
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Your Property Report — ${user.propertyAddress}`,
    html,
  });
}

/**
 * Notify the DCS team about a new contact form submission
 */
export async function notifyTeamContactForm(contact: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}): Promise<EmailResult> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B2D4F; padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #C8A951; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td>
            <td style="padding: 8px 0; color: #555;">${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
            <td style="padding: 8px 0; color: #555;"><a href="mailto:${contact.email}">${contact.email}</a></td>
          </tr>
          ${contact.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td><td style="padding: 8px 0; color: #555;">${contact.phone}</td></tr>` : ""}
          ${contact.service ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Service:</td><td style="padding: 8px 0; color: #555;">${contact.service}</td></tr>` : ""}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px;">
          <p style="margin: 0 0 4px; font-weight: bold; color: #333; font-size: 13px;">Message:</p>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">${contact.message}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: DCS_TEAM_EMAIL,
    subject: `Contact Form: ${contact.name} — ${contact.service || "General Inquiry"}`,
    html,
  });
}
