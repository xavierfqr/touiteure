import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import TweetList from "~/business/tweet/components/TweetList";
import { listTweets } from "~/business/tweet/services/index.server";
import { getUserId } from "~/business/user/services/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  return json({ tweets: await listTweets({ userId }) });
};

export default function Layout() {
  const { tweets } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <TweetList tweets={tweets} />
    </div>
  );
}
