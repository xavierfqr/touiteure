import { json, type ActionFunction } from "@remix-run/node";

import { follow, unfollow } from "~/business/user/services/index.server";
import { requireUserId } from "~/business/user/services/session.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const followedId = formData.get("followedId");
  const shouldFollow = formData.get("shouldFollow");

  if (!followedId || typeof followedId !== "string") {
    return json({ success: false }, { status: 400 });
  }

  if (!shouldFollow || typeof shouldFollow !== "string") {
    return json({ success: false }, { status: 400 });
  }

  if (shouldFollow === "true") {
    await follow(followedId, userId);
  } else {
    await unfollow(followedId, userId);
  }

  return json({ success: true });
};
