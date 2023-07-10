import { prisma } from "~/db.server";

export function listTweets() {
  return prisma.tweet.findMany({
    select: {
      id: true,
      content: true,
      attachment: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
    },
  });
}
