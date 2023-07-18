import type { SendSmtpEmail } from "sib-api-v3-typescript";
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  HttpError,
} from "sib-api-v3-typescript";

import config from "~/config";

const { apiKey, enabled, templates } = config.email;

const api = new TransactionalEmailsApi();
api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

export type Templates = keyof typeof templates;

export function getTemplateId(template: Templates): number {
  const templateId = config.email.templates[template];

  if (templateId === undefined) {
    throw new Error(`Missing templateId for template "${templateId}"`);
  }

  return parseInt(templateId, 10);
}

export async function sendTransacEmail(
  sendSmtpEmail: SendSmtpEmail,
  options: any = {}
): Promise<void> {
  if (!enabled) {
    console.info("[BREVO] Email feature is not enabled", { sendSmtpEmail });
    return;
  }

  // Sendinblue do not accepts empty object as params
  const params =
    sendSmtpEmail.params && Object.keys(sendSmtpEmail.params).length > 0
      ? sendSmtpEmail.params
      : undefined;

  try {
    await api.sendTransacEmail(
      { ...sendSmtpEmail, params },
      options
    );
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.statusCode === 429) {
        console.error(`[BREVO] Rate-limit hit!`);
      }
      console.error(`[BREVO] error`, { response: error.response });
    } else {
      console.error(`[BREVO] error`, { error });
    }

    throw error;
  }
}
