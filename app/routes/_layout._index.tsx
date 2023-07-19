import {
  type ActionArgs,
  json,
  type LoaderArgs,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { Image, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import TweetList from "~/business/tweet/components/TweetList";
import {
  gcsUploadTweetImageHandler,
  listTweets,
  postTweet,
} from "~/business/tweet/services/index.server";
import {
  getUserId,
  requireUserId,
} from "~/business/user/services/session.server";
import { getFileUrl } from "../technical/gcs.utils";

const schema = z.object({
  content: z.string().min(1, "Content is required").max(140),
  attachment: z.string().nullable(),
});

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  return json({ tweets: await listTweets({ userId }) });
};

export const action = async ({ request }: ActionArgs) => {
  const uploadHandler = unstable_composeUploadHandlers(
    gcsUploadTweetImageHandler,
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const userId = await requireUserId(request);

  try {
    const validatedForm = schema.parse(Object.fromEntries(formData));

    const newTweet = {
      content: validatedForm.content,
      attachment: validatedForm.attachment
        ? getFileUrl(validatedForm.attachment)
        : null,
    };
    await postTweet(userId, newTweet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.formErrors.fieldErrors;
      return json({ errors: fieldErrors }, { status: 400 });
    }
  }

  return json({ errors: null, status: 200 });
};

export default function Layout() {
  const { tweets } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  let isAdding = navigation.state === "submitting";
  const [imageValue, setImageValue] = useState("");
  const [contentState, setContentState] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageChangeButton(): void {
    imageInputRef?.current?.click();
  }

  useEffect(() => {
    if (!isAdding) {
      setContentState("");
      setImageValue("");
    }
  }, [isAdding]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Form method="post" className="m-20" encType="multipart/form-data">
        <textarea
          id="content"
          name="content"
          placeholder="Share your thoughts to the world..."
          autoComplete="content"
          className="h-32 w-full resize-none rounded border border-gray-300 px-4 py-2 text-lg"
          maxLength={140}
          value={contentState}
          onChange={(e) => setContentState(e.target.value)}
        />
        <input
          ref={imageInputRef}
          onChange={(e) => setImageValue(e.target.value)}
          value={imageValue}
          name="attachment"
          id="attachment"
          type="file"
          accept="image/*"
          className="hidden"
        />
        <div className="flex justify-between">
          <button
            type="button"
            className="relative mt-5 rounded border-2 border-solid border-gray-300 px-4 py-2"
            onClick={handleImageChangeButton}
          >
            <Image />
            {imageValue ? (
              <div
                className="absolute right-[-12px] top-[-8px] z-10 bg-white"
                onClick={(e) => {
                  setImageValue("");
                  e.stopPropagation();
                }}
              >
                <Trash />
              </div>
            ) : null}
          </button>
          <button
            type="submit"
            name="_action"
            disabled={contentState === ""}
            className="mt-5 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Tweet
          </button>
        </div>
      </Form>
      <hr className="mx-20 mb-20" />

      <TweetList tweets={tweets} />
    </div>
  );
}
