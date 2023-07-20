import { redirect, type LoaderFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { XCircle } from "lucide-react";

import { getUserId } from "~/business/user/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  if (userId) {
    return redirect("/");
  }

  return new Response(null, { status: 200 });
};

export default function InvalidToken() {
  return (
    <main className="flex justify-center gap-4 pt-12">
      <XCircle strokeWidth={3} className="relative top-1 text-red-500" />
      <div className="flex max-w-lg flex-col items-start">
        <h3 className="flex items-center justify-center gap-2 text-center text-2xl font-bold">
          Oups.
        </h3>
        <p>Impossible de vérifier votre adresse email.</p>
        <p className="pt-8">
          Veuillez remplir le{" "}
          <Link
            to="/login"
            className="text-slate-400 underline decoration-wavy"
          >
            formulaire d'authentification
          </Link>{" "}
          pour recevoir un nouvel email de confirmation d'adresse.
        </p>
      </div>
    </main>
  );
}
