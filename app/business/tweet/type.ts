type BaseTweet = {
  id: string;
  content: string;
  attachment: string | null;
  createdAt: string;
  liked: boolean;
};

type TweetAuthor = {
  id: string;
  username: string;
  followed: boolean;
  canFollow: boolean;
};

export type Tweet = BaseTweet & { author: TweetAuthor };
