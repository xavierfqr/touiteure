import { type LoaderArgs, json } from "@remix-run/node";
import { useLoaderData, Link, Form, NavLink, Outlet } from "@remix-run/react";
import { AbsoluteRoutes } from "../routes";
import { getUserId } from "../session.server";

import FeedIcon from "../../public/FeedIcon.svg";
import LogoutIcon from "../../public/LogoutIcon.svg";
import ProfileIcon from "../../public/ProfileIcon.svg";
import TouiteureLogo from "../../public/TouiteureLogo.svg";

const NOT_CONNECTED_TABS = [
  { id: 1, name: "Login", url: AbsoluteRoutes.login },
  { id: 2, name: "Sign up", url: AbsoluteRoutes.signup },
];

const TABS = [
  { id: 1, name: "Feed", icon: FeedIcon, url: "." },
  { id: 2, name: "Profile", icon: ProfileIcon, url: AbsoluteRoutes.profile },
  { id: 3, name: "Logout", icon: LogoutIcon, url: AbsoluteRoutes.logout },
];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  return json({ userId });
};

export default function Layout() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <div className="my-8 flex justify-center">
            <Link to="." className="flex flex-col items-center justify-center">
              <img
                src={TouiteureLogo}
                height={60}
                width={60}
                alt="touiteureIcon"
              ></img>
              <i>Oizo</i>
            </Link>
          </div>

          <ol>
            {userId
              ? TABS.map((tab) => {
                  if (tab.url === AbsoluteRoutes.logout) {
                    return (
                      <li key={tab.id}>
                        <Form action="/logout" method="post">
                          <button
                            type="submit"
                            className="block flex items-center gap-4 p-4 text-xl"
                          >
                            <img src={tab.icon} width={20} alt={tab.name} />
                            {tab.name}
                          </button>
                        </Form>
                      </li>
                    );
                  }
                  return (
                    <li key={tab.id}>
                      <NavLink
                        className={({ isActive }) =>
                          `block flex gap-4 p-4 text-xl ${
                            isActive ? "bg-white text-blue-500" : ""
                          }`
                        }
                        to={tab.url}
                      >
                        <img src={tab.icon} width={20} alt={tab.name} />
                        {tab.name}
                      </NavLink>
                    </li>
                  );
                })
              : NOT_CONNECTED_TABS.map((tab) => (
                  <li key={tab.id}>
                    <NavLink
                      className={({ isActive }) =>
                        `block flex gap-4 p-4 text-xl ${
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
