import { prisma } from "~/db.server";

export async function listTweets(userId?: string) {
  const tweets = await prisma.tweet.findMany({
    select: {
      id: true,
      content: true,
      attachment: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
    },
    where: {
      author: {
        id: userId,
      },
    },
  });

  return tweets.map((t) => ({
    ...t,
    author: { ...t.author, followed: false },
    liked: false,
  }));
}
