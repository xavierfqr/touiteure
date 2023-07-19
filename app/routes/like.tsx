import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { requireUserId } from "../business/user/services/session.server";
import { like, unlike } from "../business/tweet/services/index.server";

export const loader: LoaderFunction = () => redirect("/");

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const tweetId = formData.get("tweetId");
  const shouldLike = formData.get("shouldLike");

  if (!tweetId || typeof tweetId !== "string") {
    return json({ success: false }, { status: 400 });
  }
  if (shouldLike === null || typeof shouldLike !== "string") {
    return json({ success: false }, { status: 400 });
  }

  if (shouldLike === "true") {
    await like(tweetId, userId);
  } else {
    await unlike(tweetId, userId);
  }

  return json({ success: true });
};
