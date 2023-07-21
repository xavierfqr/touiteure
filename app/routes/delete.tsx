import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { requireUserId } from "../business/user/services/session.server";
import { deleteTweet } from "../business/tweet/services/index.server";
import invariant from "tiny-invariant";

export const loader: LoaderFunction = () => redirect("/");

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const tweetId = formData.get("tweetId");
  const authorId = formData.get("authorId");

  if (!authorId || typeof authorId !== "string") {
    return json({ sucess: false }, { status: 400 });
  }
  if (!tweetId || typeof tweetId !== "string") {
    return json({ success: false }, { status: 400 });
  }

  invariant(userId === authorId, "This operation is not allowed");

  await deleteTweet(tweetId);

  return json({ success: true });
};
