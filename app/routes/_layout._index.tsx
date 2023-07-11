import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import TweetList from "../business/tweet/components/TweetList";
import { listTweets } from "../business/tweet/services/index.server";

export const loader = async () => {
  return json({ tweets: await listTweets() });
};

export default function Layout() {
  const { tweets } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full min-h-screen flex-col">
      <TweetList tweets={tweets} />
    </div>
  );
}
