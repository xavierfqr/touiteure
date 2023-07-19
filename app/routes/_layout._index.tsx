import { type ActionArgs, json, type LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

import TweetList from "~/business/tweet/components/TweetList";
import { listTweets, postTweet } from "~/business/tweet/services/index.server";
import {
  getUserId,
  requireUserId,
} from "~/business/user/services/session.server";

const schema = z.object({
  content: z.string().min(1, "Content is required").max(140),
});

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  return json({ tweets: await listTweets({ userId }) });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const userId = await requireUserId(request);

  try {
    const validatedForm = schema.parse(Object.fromEntries(formData));
    const tweetContent = validatedForm.content;

    await postTweet(userId, tweetContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.formErrors.fieldErrors;
      return json({ errors: fieldErrors }, { status: 400 });
    }
  }

  return json({ errors: null, status: 200 });
};

export default function Layout() {
  const { tweets } = useLoaderData<typeof loader>();

  const [contentState, setContentState] = useState("");

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Form method="post" className="m-20">
        <textarea
          id="content"
          name="content"
          placeholder="Share your thoughts to the world..."
          autoComplete="content"
          className="h-32 w-full resize-none rounded border border-gray-300 px-4 py-2 text-lg"
          maxLength={140}
          value={contentState}
          onChange={(e) => setContentState(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={contentState === ""}
            className="mt-5 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Tweet
          </button>
        </div>
      </Form>
      <hr className="mx-20 mb-20" />

      <TweetList tweets={tweets} />
    </div>
  );
}
