import { json, type LoaderArgs } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { Bird, LogOut, MessageSquare, User } from "lucide-react";

import { getUserById } from "~/business/user/services/index.server";
import { getUserId } from "~/business/user/services/session.server";
import { AbsoluteRoutes } from "~/routes";

const NOT_CONNECTED_TABS = [
  { name: "Login", url: AbsoluteRoutes.login },
  { name: "Sign up", url: AbsoluteRoutes.signup },
];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);

  if (userId) {
    const user = await getUserById(userId);
    return json({ userId: user?.id, user });
  }

  return json({ userId, user: null });
};

export default function Layout() {
  const { userId, user } = useLoaderData<typeof loader>();

  const TABS = [
    { name: "Feed", icon: MessageSquare, url: "." },
    {
      name: "Profile",
      icon: User,
      url: AbsoluteRoutes.profile.replace(":username", user?.username ?? ""),
    },
    { name: "Logout", icon: LogOut, url: AbsoluteRoutes.logout },
  ];

  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <div className="my-8 flex justify-center">
            <Link to="." className="flex flex-col items-center justify-center">
              <Bird height={60} width={60} />
              <i>Oizo</i>
            </Link>
          </div>

          <ol>
            {userId
              ? TABS.map((tab) => {
                  const Icon = tab.icon;
                  if (tab.url === AbsoluteRoutes.logout) {
                    return (
                      <li key={tab.name}>
                        <Form action="/logout" method="post">
                          <button
                            type="submit"
                            className="flex items-center gap-4 p-4 text-xl"
                          >
                            <Icon />
                            {tab.name}
                          </button>
                        </Form>
                      </li>
                    );
                  }
                  return (
                    <li key={tab.name}>
                      <NavLink
                        className={({ isActive }) =>
                          `flex items-center gap-4 p-4 text-xl ${
                            isActive ? "bg-white text-blue-500" : ""
                          }`
                        }
                        to={tab.url}
                      >
                        <Icon />
                        {tab.name}
                      </NavLink>
                    </li>
                  );
                })
              : NOT_CONNECTED_TABS.map((tab) => (
                  <li key={tab.name}>
                    <NavLink
                      className={({ isActive }) =>
                        `flex gap-4 p-4 text-xl ${
                          isActive ? "bg-white text-blue-500" : ""
                        }`
                      }
                      to={tab.url}
                    >
                      {tab.name}
                    </NavLink>
                  </li>
                ))}
          </ol>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
