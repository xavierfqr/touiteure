import { prisma } from "~/db.server";

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
