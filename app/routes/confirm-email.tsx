import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";

import { askEmailConfirmation } from "~/business/auth/services/index.server";
import { getUserByEmail } from "~/business/user/services/index.server";
import { validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  return json({ email: email || "" });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const emailInput = formData.get("email");

  invariant(
    validateEmail(emailInput),
    "email must be defined and of email shape"
  );

  const user = await getUserByEmail(emailInput);

  invariant(user, "User not found by email");

  const { email } = await askEmailConfirmation(user);

  return json({ email });
};

export default function InvalidToken() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const email = actionData ? actionData.email : loaderData.email;

  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (!canResend) {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 10 * 1000); // Waiting 10s before allowing sending again an email
      return () => clearTimeout(timer);
    }
  }, [canResend]);

  return (
    <main className="flex justify-center gap-4 pt-12">
      <MailCheck strokeWidth={3} className="relative top-1 text-emerald-400" />
      <div className="flex max-w-lg flex-col items-start">
        <h3 className="flex items-center justify-center gap-2 text-center text-2xl font-bold">
          Un email est en route.
        </h3>
        <p>
          Veuillez valider votre adresse email en cliquant sur le lien dans
          l'email qui vous attend dans votre boite.
        </p>
        <p className="pt-8">
          {canResend ? (
            <>
              Aucun email reçu ?{" "}
              <Form
                method="POST"
                className="inline"
                onSubmit={() => setCanResend(false)}
              >
                <input type="hidden" value={email} name="email" />
                <button
                  type="submit"
                  className="text-slate-400 underline decoration-wavy"
                >
                  Retenter l'envoi
                </button>
              </Form>
              .
            </>
          ) : (
            <>L'email arrive...</>
          )}
        </p>
      </div>
    </main>
  );
}
