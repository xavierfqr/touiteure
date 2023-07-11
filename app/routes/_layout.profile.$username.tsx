import { type LoaderArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { getUserByUsername } from "../models/user.server";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../@/components/ui/tabs";
import { useState } from "react";
import { listTweets } from "../business/tweet/services/index.server";
import TweetList from "../business/tweet/components/TweetList";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.username, "username not found");

  const profileUser = await getUserByUsername(params.username);
  invariant(profileUser, "user not found");

  const tweets = await listTweets(profileUser.id);

  return json({ user: profileUser, tweets });
};

export default function Profile() {
  const { user, tweets } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"feed" | "likes">("feed");
  console.log(user);

  return (
    <div>
      <div className="mb-10 flex gap-10">
        <div className="flex flex-col items-center justify-center gap-5">
          <img
            src={"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="profile"
            width={200}
          />
          <button className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400">
            Follow / Unfollow / Edit
          </button>
        </div>
        <div>
          <b className="text-6xl">
            {user.firstname} {user.lastname}
          </b>
          <div className="text-gray-500">@{user.username}</div>
          <div className="mt-10">{user.biography}</div>
        </div>
      </div>
      <hr className="mb-10" />

      <Tabs defaultValue="Feed">
        <TabsList className="flex justify-around rounded bg-gray-100 p-1">
          <TabsTrigger
            value="Feed"
            className="w-full p-0"
            onClick={() => setActiveTab("feed")}
          >
            <button
              className={`w-full rounded ${
                activeTab === "feed" ? "bg-white" : ""
              } px-4 py-2 text-black`}
            >
              Touites
            </button>
          </TabsTrigger>
          <TabsTrigger
            value="Likes"
            className="w-full p-0"
            onClick={() => setActiveTab("likes")}
          >
            <button
              className={`w-full rounded ${
                activeTab === "likes" ? "bg-white" : ""
              } px-4 py-2 text-black`}
            >
              Likes
            </button>
          </TabsTrigger>
        </TabsList>
        <div className="mt-10">
          <TabsContent value="Feed" className="flex justify-center">
            <TweetList tweets={tweets} />
          </TabsContent>
          <TabsContent value="Likes" className="flex justify-center">
            Change your password here.
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
