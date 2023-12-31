import type { Tweet } from "@prisma/client";
import { prisma } from "~/db.server";
import { gcsUploadImageHandler } from "../../../technical/gcs.utils";

export async function listTweets({
  authorId,
  userId,
  isLiked,
}: {
  userId?: string;
  authorId?: string;
  isLiked?: boolean
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
      likes: {
        where: {
          id: userId
        }
      }
    },
    where: isLiked ? 
      {
        likes: {
          some: {
            id: userId
          }
        }
      } : 
      {
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
      liked: t.likes.length === 1,
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


export async function like(tweetId: string, userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { likes: { connect: { id: tweetId } } },
  });
}

export async function unlike(tweetId: string, userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { likes: { disconnect: { id: tweetId } } },
  });
}


export async function deleteTweet(tweetId: string) {
  return await prisma.tweet.delete({
    where: { id: tweetId },
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
