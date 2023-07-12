import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import {
  getUserByUsername,
  updateUser,
} from "~/business/user/services/index.server";
import { requireUserId } from "../session.server";
import { Switch } from "../ui/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/components/ui/popover";
import { MoreVertical, Replace, Trash } from "lucide-react";

const defaultFormResponse = {
  fields: {
    firstname: "",
    lastname: "",
    biography: "",
    isFollowOnly: "",
  },
  errors: {
    firstname: null,
    lastname: null,
    biography: null,
    isFollowOnly: null,
  },
  formError: null,
};

const schema = z.object({
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  biography: z.string().max(200),
  isFollowOnly: z.string().optional(),
});

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.username, "username not found");

  const user = await getUserByUsername(params.username);
  invariant(user, "user not found");

  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const userId = await requireUserId(request);

  try {
    const validatedForm = schema.parse(Object.fromEntries(formData));
    const updatedUser = {
      ...validatedForm,
      isFollowOnly: validatedForm.isFollowOnly === "on" ? true : false,
    };

    await updateUser(userId, updatedUser);
    return json(
      { ...defaultFormResponse, fields: { ...validatedForm } },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.formErrors.fieldErrors;
      return json(
        { ...defaultFormResponse, errors: fieldErrors },
        { status: 400 }
      );
    }
    return json(
      { ...defaultFormResponse, formError: "Failed to apply changes" },
      { status: 400 }
    );
  }
};

export default function LoginPage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const biographyRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChangeButton = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    void file;
    // TODO: handle image upload
  };

  useEffect(() => {
    if (actionData?.errors?.firstname) {
      firstnameRef.current?.focus();
    } else if (actionData?.errors?.lastname) {
      lastnameRef.current?.focus();
    } else if (actionData?.errors?.biography) {
      biographyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col justify-center">
      <Form method="post" className="space-y-6">
        <div>
          <div className="relative mb-10 w-fit">
            <img
              className="rounded-full"
              src={"https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="profile"
              width={200}
            />
            <div className="absolute right-[-10px] top-0 flex flex-col">
              <Popover>
                <PopoverTrigger>
                  <MoreVertical />
                </PopoverTrigger>
                <PopoverContent className="w-fit cursor-pointer px-2 py-1">
                  <div
                    className="flex  items-center gap-4 p-2"
                    onClick={handleFileChangeButton}
                  >
                    <Replace />
                    Change picture
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <hr />
                  <div className="flex items-center gap-4 p-2">
                    <Trash />
                    Remove picture
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <label
            htmlFor="firstname"
            className="block text-sm font-medium text-gray-700"
          >
            Firstname
          </label>
          <div className="mt-1">
            <input
              defaultValue={
                actionData ? actionData.fields.firstname : user.firstname
              }
              id="firstname"
              ref={firstnameRef}
              name="firstname"
              type="firstname"
              autoComplete="firstname"
              aria-invalid={actionData?.errors?.firstname ? true : undefined}
              aria-describedby="firstname-error"
              className="w-full rounded border border-gray-300 px-2 py-1 text-lg"
            />
            {actionData?.errors?.firstname ? (
              <div className="pt-1 text-red-700" id="firstname-error">
                {actionData.errors.firstname}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="lastname"
            className="block text-sm font-medium text-gray-700"
          >
            lastname
          </label>
          <div className="mt-1">
            <input
              defaultValue={
                actionData ? actionData.fields.lastname : user.lastname
              }
              id="lastname"
              ref={lastnameRef}
              name="lastname"
              type="lastname"
              autoComplete="lastname"
              aria-invalid={actionData?.errors?.lastname ? true : undefined}
              aria-describedby="lastname-error"
              className="w-full rounded border border-gray-300 px-2 py-1 text-lg"
            />
            {actionData?.errors?.lastname ? (
              <div className="pt-1 text-red-700" id="lastname-error">
                {actionData.errors.lastname}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="biography"
            className="block text-sm font-medium text-gray-700"
          >
            Biography
          </label>
          <div className="mt-1">
            <textarea
              defaultValue={
                actionData ? actionData.fields.biography : user.biography
              }
              id="biography"
              ref={biographyRef}
              name="biography"
              placeholder="Tell us about you..."
              autoComplete="biography"
              aria-invalid={actionData?.errors?.biography ? true : undefined}
              aria-describedby="biography-error"
              className="h-24 w-full resize-none rounded border border-gray-300 px-2 py-1 text-lg"
              maxLength={200}
            />
            {actionData?.errors?.biography ? (
              <div className="pt-1 text-red-700" id="biography-error">
                {actionData.errors.biography}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            defaultValue={
              actionData
                ? actionData.fields.isFollowOnly
                : user.isFollowOnly
                ? "on"
                : "off"
            }
            defaultChecked={
              actionData
                ? actionData.fields.isFollowOnly === "on"
                  ? true
                  : false
                : user.isFollowOnly
            }
            name="isFollowOnly"
            id="isFollowOnly"
          />
          Follow only
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </Form>
    </div>
  );
}
