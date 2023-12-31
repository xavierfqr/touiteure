import { json, redirect, type LoaderArgs } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Bird, Heart } from "lucide-react";
import { useState } from "react";
import invariant from "tiny-invariant";

import {
  getUserByUsername,
  isUserFollowed,
} from "~/business/user/services/index.server";
import { getUserId } from "~/business/user/services/session.server";
import { Tabs, TabsList, TabsTrigger } from "~/ui/components/ui/tabs";

export const DEFAULT_PFP =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.username, "username not found in params");

  const loggedUserId = await getUserId(request);
  const user = await getUserByUsername(params.username);
  invariant(user, "user not found");

  if (!user.isVerified) {
    return redirect("/login");
  }

  const followed = loggedUserId
    ? await isUserFollowed(user.id, loggedUserId)
    : false;

  const isCurrentUserProfile = loggedUserId === user.id;
  return json({ user, isCurrentUserProfile, followed });
};

export default function Profile() {
  const { user, isCurrentUserProfile, followed } =
    useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const activeTab = pathname.substring(pathname.lastIndexOf("/") + 1);
  const fetcher = useFetcher();
  const pendingFollowToggle = fetcher.state !== "idle";
  const [isFollowButtonHovered, setIsFollowButtonHovered] = useState(false);

  const optimisticFollowed = pendingFollowToggle
    ? fetcher.formData?.get("shouldFollow") === "true"
    : followed;
  const followButtonClassName = optimisticFollowed
    ? isFollowButtonHovered
      ? "w-full rounded bg-red-500 px-4 py-2 text-center text-white hover:bg-red-600 focus:bg-red-400"
      : "w-full rounded bg-green-500 px-4 py-2 text-center text-white hover:bg-green-600 focus:bg-green-400"
    : "w-full rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600 focus:bg-blue-400";

  return (
    <div>
      <div className="mb-10 flex gap-10">
        <div className="flex flex-col items-center justify-center gap-5">
          <img
            className="rounded-full"
            src={user.profilePicture ? user.profilePicture : DEFAULT_PFP}
            alt="profile"
            width={200}
          />
          {isCurrentUserProfile ? (
            <NavLink
              to="edit"
              className="w-full rounded border-2 border-blue-500 px-4 py-2 text-center text-blue-500 hover:border-blue-600 hover:bg-blue-600 hover:text-white focus:border-blue-400 focus:bg-blue-400 focus:text-white"
            >
              Edit
            </NavLink>
          ) : (
            <fetcher.Form action="/follow" method="post" className="w-full">
              <input
                type="hidden"
                value={optimisticFollowed ? "false" : "true"}
                name="shouldFollow"
              />

              <button
                type="submit"
                name="followedId"
                value={user.id}
                className={followButtonClassName}
                onMouseEnter={() => setIsFollowButtonHovered(true)}
                onMouseLeave={() => setIsFollowButtonHovered(false)}
              >
                {optimisticFollowed
                  ? isFollowButtonHovered
                    ? "Unfollow"
                    : "Followed"
                  : "Follow"}
              </button>
            </fetcher.Form>
          )}
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

      <Tabs defaultValue={activeTab}>
        <TabsList className="flex justify-around rounded bg-gray-100 p-1">
          <TabsTrigger value="feed" className="w-full p-0">
            <Link
              to="feed"
              className={`flex w-full items-center justify-center gap-2 rounded ${
                activeTab === "feed" ? "bg-white" : ""
              } px-4 py-1 text-black`}
            >
              <Bird /> Touites
            </Link>
          </TabsTrigger>
          <TabsTrigger value="likes" className="w-full p-0">
            <Link
              to="likes"
              className={`flex w-full items-center justify-center gap-2 rounded  ${
                activeTab === "likes" ? "bg-white" : ""
              } px-4 py-1 text-black`}
            >
              <Heart /> Likes
            </Link>
          </TabsTrigger>
        </TabsList>
        <div className="mt-10">
          <Outlet />
        </div>
      </Tabs>
    </div>
  );
}
