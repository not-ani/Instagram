import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Activity = () => {
  const { data: sessionData } = useSession();
  const data = api.user.getActivity.useQuery();
  // mix likes and comments and sort by date
  if (!data.data) {
    return null;
  }
  if (!data.data?.likes && !data.data?.comments) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-lg">No activity yet</p>
      </div>
    );
  }
  const likes =
    data.data?.likes?.map((like) => ({ ...like, type: "like" })) || [];
  const comments =
    data.data?.comments?.map((comment) => ({ ...comment, type: "comment" })) ||
    [];

  const activity = [...likes, ...comments].sort((a, b) => {
    if (!a.post?.createdAt || !b.post?.createdAt) {
      return 0;
    }
    return (
      new Date(b.post?.createdAt).getTime() -
      new Date(a.post?.createdAt).getTime()
    );
  });

  if (!sessionData?.user) {
    signIn();
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold">Activity</h1>
      {activity.map((activity) => {
        if (activity.type === "like") {
          return (
            <div className="flex flex-row items-center justify-center gap-2">
              <Avatar>
                <AvatarImage>{activity.user?.image}</AvatarImage>
                <AvatarFallback>{activity.user?.name[0]}</AvatarFallback>
              </Avatar>
              <p>{activity.user?.name}</p>
              <p>like your post</p>
              <Link href={`/posts/${activity.post?.id}`}>
                <p>{activity.post?.title}</p>
              </Link>
            </div>
          );
        } else {
          return (
            <div className="flex flex-row items-center justify-center gap-2">
              <Avatar>
                <AvatarImage>{activity.user?.image}</AvatarImage>
                <AvatarFallback>{activity.user?.name[0]}</AvatarFallback>
              </Avatar>
              <p>{activity.user?.name}</p>
              <p>commented on your post</p>
              <Link href={`/posts/${activity.post?.id}`}>
                <p>{activity.post?.title}</p>
              </Link>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Activity;
