import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

export type SendEmailResult =
  | { success: true }
  | { success: false; error: string };
const NO_REPLY_EMAIL = process.env.RESEND_NO_REPLY_EMAIL!;

export async function sendVerificationEmail(
  userName: string,
  token: string,
  tokenExpiry: Date,
  email: string,
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #4CAF50;">Verify Your Email</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for signing up! Please use the verification code below:</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #333; margin: 0;">${token}</p>
      </div>
      <p style="color: #666; font-size: 14px;">Enter this code to verify your account.</p>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">This code expires at ${tokenExpiry.toLocaleString()}.</p>
    </div>
    `;

  return sendEmail(htmlContent, "Verify Your Account", email, NO_REPLY_EMAIL);
}
async function sendEmail(
  htmlContent: string,
  subject: string,
  receiver: string,
  sender: string,
): Promise<SendEmailResult> {
  try {
    const { error } = await resend.emails.send({
      from: sender,
      to: [receiver],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: "Error sending email" };
    }
    return { success: true };
  } catch (error) {
    console.error("Unexpected error sending email:", error);
    return { success: false, error: "Unexpected error sending email" };
  }
}
