import invariant from "tiny-invariant";

invariant(process.env.BASE_URL, "BASE_URL must be set");
invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
invariant(process.env.EMAIL_ENABLED, "EMAIL_ENABLED must be set");
invariant(process.env.SENDER_EMAIL_ADDRESS, "SENDER_EMAIL_ADDRESS must be set");
invariant(process.env.BREVO_API_KEY, "BREVO_API_KEY must be set");
invariant(
  process.env.BREVO_CONFIRM_EMAIL_ADDRESS_TEMPLATE_ID,
  "BREVO_CONFIRM_EMAIL_ADDRESS_TEMPLATE_ID must be set"
);
invariant(
  !Number.isNaN(Number(process.env.MAGIC_LINK_TOKEN_LENGTH || undefined)),
  "MAGIC_LINK_TOKEN_LENGTH must be a number"
);

export default {
  app: { baseUrl: process.env.BASE_URL },
  auth: {
    secrets: [process.env.SESSION_SECRET],
    magicLinkTokenLength: Number(process.env.MAGIC_LINK_TOKEN_LENGTH),
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === "true",
    senderEmailAddress: process.env.SENDER_EMAIL_ADDRESS,
    apiKey: process.env.BREVO_API_KEY,
    templates: {
      confirmEmailAddress: process.env.BREVO_CONFIRM_EMAIL_ADDRESS_TEMPLATE_ID,
    },
  },
};
