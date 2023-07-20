import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import {
  json,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { MoreVertical, Replace, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import {
  gcsUploadUserPFPHandler,
  getUserByUsername,
  updateUser,
} from "~/business/user/services/index.server";
import { requireUserId } from "~/business/user/services/session.server";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/ui/components/ui/popover";
import { Switch } from "~/ui/components/ui/switch";
import { getFileUrl } from "../technical/gcs.utils";
import { DEFAULT_PFP } from "./_layout.profile.$username";

const defaultFormResponse = {
  fields: {
    firstname: "",
    lastname: "",
    biography: "",
    isFollowOnly: "",
    profilePicture: null,
    isPFPRemoved: false,
  },
  errors: {
    firstname: null,
    lastname: null,
    biography: null,
    isFollowOnly: null,
    profilePicture: null,
    isPFPRemoved: null,
  },
  formError: null,
};

const schema = z.object({
  firstname: z.string().min(1, "Firstname is required"),
  lastname: z.string().min(1, "Lastname is required"),
  biography: z.string().max(200),
  isFollowOnly: z.enum(["on", "off"]).optional(),
  profilePicture: z.string().nullable(),
  isPFPRemoved: z.string().nullable().optional(),
});

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.username, "username not found");

  const user = await getUserByUsername(params.username);
  invariant(user, "user not found");

  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const uploadHandler = unstable_composeUploadHandlers(
    gcsUploadUserPFPHandler,
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const userId = await requireUserId(request);

  try {
    const validatedForm = schema.parse(Object.fromEntries(formData));

    const updatedUser = {
      ...validatedForm,
      profilePicture:
        validatedForm.profilePicture &&
        validatedForm.profilePicture !== "default"
          ? getFileUrl(validatedForm.profilePicture)
          : validatedForm.isPFPRemoved === "true"
          ? null
          : undefined,
      isFollowOnly: validatedForm.isFollowOnly === "on" ? true : false,
    };
    delete updatedUser.isPFPRemoved;

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

  const [imageUrl, setImageUrl] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPFPRemoved, setIsPFPRemoved] = useState<"true" | "false">("false");

  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const biographyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.firstname) {
      firstnameRef.current?.focus();
    } else if (actionData?.errors?.lastname) {
      lastnameRef.current?.focus();
    } else if (actionData?.errors?.biography) {
      biographyRef.current?.focus();
    }
  }, [actionData]);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    setImageUrl(URL.createObjectURL(file));
  };

  function handlePFPChangeButton(): void {
    fileInputRef?.current?.click();
    setIsPopoverOpen(false);
  }

  function handleRemovePFP() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsPFPRemoved("true");
    setImageUrl(DEFAULT_PFP);
    setIsPopoverOpen(false);
  }

  return (
    <div
      className="flex flex-col justify-center"
      onClick={(e) => {
        setIsPopoverOpen(false);
      }}
    >
      <Form method="post" encType="multipart/form-data" className="space-y-6">
        <div>
          <div className="relative mb-10 w-fit">
            <img
              className="rounded-full"
              src={
                imageUrl
                  ? imageUrl
                  : user.profilePicture
                  ? user.profilePicture
                  : DEFAULT_PFP
              }
              alt="profile"
              width={200}
              height={200}
            />
            <div className="absolute right-[-10px] top-0 flex flex-col">
              <Popover open={isPopoverOpen}>
                <PopoverTrigger
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPopoverOpen(true);
                  }}
                >
                  <MoreVertical />
                </PopoverTrigger>
                <PopoverContent
                  className="w-fit cursor-pointer px-2 py-1"
                  ref={popupRef}
                >
                  <div
                    className="flex items-center gap-4 p-2"
                    onClick={handlePFPChangeButton}
                  >
                    <Replace />
                    Change picture
                  </div>
                  <hr />
                  <div
                    className="flex items-center gap-4 p-2"
                    onClick={handleRemovePFP}
                  >
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
        <input
          ref={fileInputRef}
          name="profilePicture"
          id="profilePicture"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          onChange={() => {}}
          value={isPFPRemoved}
          name="isPFPRemoved"
          type="text"
          className="hidden"
        />

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
