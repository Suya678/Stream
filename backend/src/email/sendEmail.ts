import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);
export type SendEmailResult =
  | { success: true }
  | { success: false; error: string };

export async function sendEmail(
  htmlContent: string,
  subject: string,
  receiver: string,
): Promise<SendEmailResult> {
  try {
    const senderEmail = process.env.RESEND_EMAIL!;

    const { data, error } = await resend.emails.send({
      from: senderEmail,
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
