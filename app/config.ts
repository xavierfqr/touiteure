import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
invariant(process.env.EMAIL_ENABLED, "EMAIL_ENABLED must be set");
invariant(process.env.SENDER_EMAIL_ADDRESS, "SENDER_EMAIL_ADDRESS must be set");
invariant(process.env.BREVO_API_KEY, "BREVO_API_KEY must be set");

export default {
  auth: {
    secrets: [process.env.SESSION_SECRET],
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === "true",
    senderEmailAddress: process.env.SENDER_EMAIL_ADDRESS,
    apiKey: process.env.BREVO_API_KEY,
  },
};
