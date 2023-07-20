import { Link, useFetcher } from "@remix-run/react";
import {  Heart, UserCheck2, UserPlus2, UserX2 } from "lucide-react";

import type { Tweet } from "~/business/tweet/type";
import { formatISODate } from "~/technical/formatDate";
import { AbsoluteRoutes } from "~/routes";
import { useState } from "react";
import Lottie from 'react-lottie';
import likeAnimation from '../../../../lotties/like.json';

type TweetProps = Tweet;

export default function Tweet({
  author: { id, username, followed, canFollow },
  id: tweetId,
  content,
  attachment,
  liked,
  createdAt,
}: TweetProps) {
  const defaultOptions = {
    loop: false,
    autoplay: false,
    animationData: likeAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const fetcher = useFetcher();
  const likeFetcher = useFetcher();
  const pendingFollowToggle = fetcher.state !== "idle";
  const optimisticFollowed = pendingFollowToggle
    ? fetcher.formData?.get("shouldFollow") === "true"
    : followed;
  const [isFollowButtonHovered, setIsFollowButtonHovered] = useState(false);

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
          <fetcher.Form action="/follow" method="post" className="flex">
            <input
              type="hidden"
              value={optimisticFollowed ? "false" : "true"}
              name="shouldFollow"
            />
            <button
              type="submit"
              name="followedId"
              value={id}
              onMouseEnter={() => setIsFollowButtonHovered(true)}
              onMouseLeave={() => setIsFollowButtonHovered(false)}
            >
              {optimisticFollowed ? (
                <>
                  {isFollowButtonHovered ? (
                    <UserX2
                      className="text-red-400"
                      size={20}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <UserCheck2
                      className="text-emerald-400"
                      size={20}
                      strokeWidth={2.5}
                    />
                  )}
                </>
              ) : (
                <UserPlus2
                  className="text-sky-500"
                  size={20}
                  strokeWidth={2.5}
                />
              )}
            </button>
          </fetcher.Form>
        ) : null}
      </div>
      <p className="text-lg font-light">{content}</p>
      {attachment ? <img src={attachment} alt="Attachment" /> : null}
      <div className="flex place-content-between items-center">
        <p className="text-sm text-slate-400">{formatISODate(createdAt)}</p>
        <likeFetcher.Form action="/like" method="post">
          <input
              type="hidden"
              value={liked ? "false" : "true"}
              name="shouldLike"
            />
            <input
              type="hidden"
              value={tweetId}
              name="tweetId"
            />
          <button type="submit">
            <Lottie 
              options={defaultOptions}
              height={50}
              width={50}
              isClickToPauseDisabled
              isStopped={!liked}
              style={{ display: liked ? "block" : "none" }}
            />
          
            <Heart
                className={`${liked ? "hidden" : "block"} text-sky-500 m-[15px]`}
                size={20}
                strokeWidth={2.5}
              />

          </button>
        </likeFetcher.Form>
      </div>
    </div>
  );
}
