import type { User } from "@prisma/client";
import { nanoid } from "nanoid";

import config from "~/config";
import { prisma } from "~/db.server";
import { send as sendEmail } from "~/technical/email";
import { Template } from "~/technical/email/types";

export function getMagicLinkFromToken(token: string) {
  return `${config.app.baseUrl}/ml/${token}`;
}

export function verifyUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isVerified: true, magicLinkToken: null },
  });
}

export async function askEmailConfirmation(user: User) {
  const magicLinkToken = nanoid(config.auth.magicLinkTokenLength);

  await prisma.user.update({
    where: { id: user.id },
    data: { magicLinkToken },
  });

  await sendEmail({
    to: [{ email: user.email }],
    template: Template.confirmEmailAddress,
    params: {
      MAGIC_LINK: getMagicLinkFromToken(magicLinkToken),
    },
  });

  return { email: user.email };
}
