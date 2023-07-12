import { json, type LoaderArgs } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Bird, Heart } from "lucide-react";
import invariant from "tiny-invariant";

import { getUserByUsername } from "~/business/user/services/index.server";
import { getUserId } from "~/business/user/services/session.server";
import { Tabs, TabsList, TabsTrigger } from "~/ui/components/ui/tabs";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.username, "username not found in params");

  const loggedUserId = await getUserId(request);
  const user = await getUserByUsername(params.username);
  invariant(user, "user not found");

  const isCurrentUserProfile = loggedUserId === user.id;
  return json({ user, isCurrentUserProfile });
};

export default function Profile() {
  const { user, isCurrentUserProfile } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const activeTab = pathname.substring(pathname.lastIndexOf("/") + 1);

  return (
    <div>
      <div className="mb-10 flex gap-10">
        <div className="flex flex-col items-center justify-center gap-5">
          <img
            className="rounded-full"
            src={"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="profile"
            width={200}
          />
          {isCurrentUserProfile ? (
            <NavLink
              to="edit"
              className="w-full rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Edit
            </NavLink>
          ) : (
            <button className="w-full  rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600 focus:bg-blue-400">
              Follow / Unfollow
            </button>
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
              to=""
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
