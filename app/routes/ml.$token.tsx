import { redirect, type LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";

import { verifyUser } from "~/business/auth/services/index.server";
import { getUserByMagicLinkToken } from "~/business/user/services/index.server";

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.token, "token not found in params");

  const { token } = params;

  const user = await getUserByMagicLinkToken(token);

  if (!user) {
    return redirect("/invalid-token");
  }

  await verifyUser(user.id);

  return redirect("/login?msg=verified");
};
