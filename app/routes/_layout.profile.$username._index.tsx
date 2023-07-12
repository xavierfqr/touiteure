import { redirect, type LoaderArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  return redirect("feed");
};
