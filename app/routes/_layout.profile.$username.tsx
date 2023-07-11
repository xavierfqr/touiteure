import { type LoaderArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { getUserByUsername } from "../models/user.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.username, "username not found");
  const user = await getUserByUsername(params.username);
  invariant(user, "user not found");
  return json({ user });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

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
            Follow / Unfollow
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
      <hr />

      <div className="mt-10">
        <div>Touits</div>
        {/* TODO : Add TweetList component */}
      </div>
    </div>
  );
}
