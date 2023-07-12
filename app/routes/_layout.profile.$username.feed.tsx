import { TabsContent } from "@radix-ui/react-tabs";
import { type LoaderArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import TweetList from "../business/tweet/components/TweetList";
import { listTweets } from "../business/tweet/services/index.server";
import { getUserByUsername } from "../business/user/services/index.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.username, "username not found");

  const user = await getUserByUsername(params.username);
  invariant(user, "user not found");

  const tweets = await listTweets(user.id);

  return json({ tweets });
};

export default function Feed() {
  const { tweets } = useLoaderData<typeof loader>();

  return (
    <TabsContent value="feed" className="flex justify-center">
      <TweetList tweets={tweets} />
    </TabsContent>
  );
}
