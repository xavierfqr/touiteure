import { TabsContent } from "@radix-ui/react-tabs";
import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import TweetList from "~/business/tweet/components/TweetList";
import { listTweets } from "~/business/tweet/services/index.server";
import { getUserByUsername } from "~/business/user/services/index.server";
import { getUserId } from "~/business/user/services/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.username, "username not in params");

  const author = await getUserByUsername(params.username);
  invariant(author, "author not found");

  const userId = await getUserId(request);
  const tweets = await listTweets({ authorId: author.id, userId });

  return json({ tweets, userId });
};

export default function Feed() {
  const { tweets, userId } = useLoaderData<typeof loader>();

  return (
    <TabsContent value="feed" className="flex justify-center">
      <TweetList tweets={tweets} userId={userId}/>
    </TabsContent>
  );
}
