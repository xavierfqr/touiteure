import { prisma } from "~/db.server";

export async function listTweets() {
  const tweets = await prisma.tweet.findMany({
    select: {
      id: true,
      content: true,
      attachment: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
    },
  });

  return tweets.map((t) => ({
    ...t,
    author: { ...t.author, followed: false },
    liked: false,
  }));
}
