import { Form, Link } from "@remix-run/react";
import { Heart, UserPlus2 } from "lucide-react";

import type { Tweet } from "~/business/tweet/type";
import { formatISODate } from "~/technical/formatDate";
import { AbsoluteRoutes } from "~/routes";

type TweetProps = Tweet;

export default function Tweet({
  author: { id, username, followed, canFollow },
  content,
  attachment,
  liked,
  createdAt,
}: TweetProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 p-4">
      <div className="flex items-center gap-2">
        <Link
          className="font-bold"
          to={AbsoluteRoutes.profile.replace(":username", username)}
        >
          @{username}
        </Link>

        {canFollow ? (
          <Form action="/follow" method="post">
            <input
              type="hidden"
              value={followed ? "false" : "true"}
              name="shouldFollow"
            />
            <button type="submit" name="followedId" value={id}>
              {followed ? (
                <UserPlus2
                  className="text-emerald-400"
                  size={20}
                  strokeWidth={2.5}
                />
              ) : (
                <UserPlus2
                  className="text-sky-500"
                  size={20}
                  strokeWidth={2.5}
                />
              )}
            </button>
          </Form>
        ) : null}
      </div>
      <p className="text-lg font-light">{content}</p>
      {attachment ? <img src={attachment} alt="Attachment" /> : null}
      <div className="flex place-content-between items-center">
        <p className="text-sm text-slate-400">{formatISODate(createdAt)}</p>
        <button>
          <Heart
            className={`${liked ? "fill-sky-500" : ""} text-sky-500`}
            size={20}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
