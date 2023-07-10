import type { TweetProps } from "./Tweet";
import Tweet from "./Tweet";

interface TweetListProps {
  tweets: TweetProps[];
}

export default function TweetList({ tweets }: TweetListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </div>
  );
}
