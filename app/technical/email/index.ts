import config from "~/config";
import { getTemplateId, sendTransacEmail } from "~/technical/email/brevo";
import type { TemplatedEmails } from "./types";

export async function send(templatedEmail: TemplatedEmails): Promise<void> {
  const { template, params, ...rest } = templatedEmail;
  try {
    await sendTransacEmail({
      sender: { email: config.email.senderEmailAddress },
      templateId: getTemplateId(template),
      params,
      ...rest,
    });
  } catch (error) {
    console.error(`[EMAIL] error occurred while sending email`, { error });
    throw error;
  }
}
