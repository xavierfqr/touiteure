import type { Tweet } from "@prisma/client";
import { prisma } from "~/db.server";
import { gcsUploadImageHandler } from "../../../technical/gcs.utils";

export async function listTweets({
  authorId,
  userId,
}: {
  userId?: string;
  authorId?: string;
}) {
  const tweets = await prisma.tweet.findMany({
    select: {
      id: true,
      content: true,
      attachment: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          _count: { select: { followedBy: { where: { id: userId } } } },
        },
      },
    },
    where: {
      author: {
        id: authorId,
      },
    },
  });

  return tweets.map((t) => {
    const { _count, ...rest } = t.author;

    return {
      ...t,
      author: {
        ...rest,
        followed: !!_count.followedBy,
        canFollow: userId ? userId !== t.author.id : false,
      },
      liked: false,
    };
  });
}


export async function postTweet(authorId: Tweet["authorId"], tweet: Pick<Tweet, 'content' | 'attachment'>) {
  await prisma.tweet.create({
    data: {
      content: tweet.content,
      attachment: tweet.attachment,
      authorId
    }
  })
}

export const gcsUploadTweetImageHandler = async ({
  name,
  data,
  contentType,
  filename,
}: {
  name: string;
  data: AsyncIterable<Uint8Array>;
  contentType: string;
  filename?: string;
}) => {
  if (name !== "attachment") {
    return;
  }

  if (!filename) {
    return "";
  }


  return gcsUploadImageHandler({ name, data, contentType, filename });
};