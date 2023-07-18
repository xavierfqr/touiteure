import type { Templates } from "~/technical/email/brevo";

/**
 * Basics
 */

export enum Template {
  confirmEmailAddress = "confirmEmailAddress",
}

export interface Email {
  to: Array<{ name?: string; email: string }>;
  subject?: string;
  params: {
    [key: string]: string | string[];
  };
}

interface TemplatedEmail<T extends Templates> extends Email {
  template: T;
}

/**
 * Emails
 */

export interface ConfirmEmailAddressTemplatedEmail
  extends TemplatedEmail<Template.confirmEmailAddress> {
  params: {
    MAGIC_LINK: string;
  };
}

/**
 * Emails collections
 */

export type TemplatedEmails = ConfirmEmailAddressTemplatedEmail;
