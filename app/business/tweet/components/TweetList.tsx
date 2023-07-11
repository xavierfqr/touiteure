import Tweet from "~/business/tweet/components/Tweet";
import type { Tweet as TweetType } from "~/business/tweet/type";

interface TweetListProps {
  tweets: TweetType[];
}

export default function TweetList({ tweets }: TweetListProps) {
  return (
    <div className="flex w-full flex-col gap-8">
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </div>
  );
}
