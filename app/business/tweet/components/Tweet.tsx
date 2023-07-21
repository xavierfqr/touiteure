import { Form, Link, useFetcher } from "@remix-run/react";
import {  Heart, Trash, UserCheck2, UserPlus2, UserX2, XCircle } from "lucide-react";

import type { Tweet } from "~/business/tweet/type";
import { AbsoluteRoutes } from "~/routes";
import { useState } from "react";
import Lottie from 'react-lottie';
import likeAnimation from '../../../../lotties/like.json';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { DialogHeader } from "../../../ui/components/ui/dialog";
import { formatISODate } from "../../../technical/formatDate";

type TweetProps = Tweet & { userId?: string };

export default function Tweet({
  author: { id, username, followed, canFollow },
  id: tweetId,
  content,
  attachment,
  liked,
  createdAt,
  userId
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
  const [isOpenModal, setIsOpenModal] = useState(false);

  const closeModal = () => {
    setIsOpenModal(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 p-4" data-testid="touite">
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
      {userId === id ?
        (<div className="flex place-content-between items-center">
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400">{formatISODate(createdAt)}</p>
            <Dialog open={isOpenModal}>
              <DialogTrigger onClick={() => setIsOpenModal(true)}><Trash/></DialogTrigger>
              <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-300 rounded p-4 w-[30rem]">
                <DialogHeader className="flex">
                  <DialogTitle className="flex justify-between mb-5">
                    <h1 className="text-xl mx-2">
                      Are you sure you want to delete your touite ?
                    </h1>
                    <button type="button" onClick={closeModal}>
                      <XCircle />
                    </button>
                  </DialogTitle>
                  <DialogDescription className="flex justify-between">
                    <button type="button" onClick={closeModal} className="hover:bg-gray-100 p-2 rounded">Cancel</button>
                    <Form action="/delete" method="post" className="flex items-center gap-4" preventScrollReset>
                      <div>
                        <input
                          type="hidden"
                          value={tweetId}
                          name="tweetId"
                        />
                        <input
                          type="hidden"
                          value={id}
                          name="authorId"
                        />
                        <button type="submit" className="text-green-500 hover:bg-green-100 rounded p-2">Confirm</button>
                      </div>
                    </Form>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
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
            <button type="submit" data-testid="like-btn">
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
        </div>) : null}
    </div>
  );
}
