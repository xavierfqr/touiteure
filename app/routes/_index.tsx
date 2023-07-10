import { json, type V2_MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import TweetList from "~/components/TweetList";
import { listTweets } from "~/models/tweet.server";
import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Touitteur" }];

export const loader = async () => {
  return json({ tweets: await listTweets() });
};

export default function Index() {
  const user = useOptionalUser();
  const { tweets } = useLoaderData<typeof loader>();

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="m-8 mx-auto max-w-sm sm:flex sm:max-w-none sm:justify-center">
            {user ? (
              <div>
                <p>You are {user.email}</p>
                <Form action="logout" method="post">
                  <button type="submit">Logout</button>
                </Form>
              </div>
            ) : (
              <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                <Link
                  to="/signup"
                  className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
          <div className="m-8 max-w-xl">
            <TweetList
              tweets={tweets.map((t) => ({
                ...t,
                // TODO Compute this in listTweets?
                liked: false,
                followed: false,
              }))}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
