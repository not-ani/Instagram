/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link"
import Image from "next/image"
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import type { AppRouter } from "@/server/api/root";
import { api } from "@/utils/api";
import type { inferProcedureOutput } from "@trpc/server";
import useEmblaCarousel from "embla-carousel-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { MessageCircle, MoreHorizontalIcon, ThumbsUpIcon } from "lucide-react";
import { PostSkeleton } from "@/components/skeletons";

const Post = React.memo(function Post({
  post,
}: {
  post: inferProcedureOutput<AppRouter['post']['findOne']>
}) {
  const { toast } = useToast();

  const [emblaRef] = useEmblaCarousel({ loop: false });
  const [likeCount, setLikeCount] = useState(post?._count.likes);
  const [isLiked, setIsLiked] = useState(false);
  const likeMutation = api.post.like.useMutation({
    onSuccess: () => {
      toast({
        title: "Liked",
        description: "You liked this post",
        duration: 3000,
      });
    },
  }).mutateAsync;
  const unlikeMutation = api.post.unlike.useMutation({
    onSuccess: () => {
      toast({
        title: "Unliked",
        description: "You unliked this post",
        duration: 3000,
      });
    },
  }).mutateAsync;

  const hasLiked = post?.likes.length as number > 0;
  const handleLikeClick = (postId: string, hasLiked: boolean) => {
    // Optimistically update the like count
    setLikeCount(likeCount as number + (hasLiked ? -1 : 1));

    if (isLiked) {
      unlikeMutation({ postId }).catch(() => { console.log("error") });
      setIsLiked(false);
      return;
    }

    likeMutation({ postId }).catch(() => { console.log("error") });
    setIsLiked(true);
  };
  return (
    <div className="flex flex-col p-10 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {post?.user?.image && (
            <Avatar>
              <Image
                src={post.user?.image}
                alt={`${post.user?.name as string} profile picture`}
                width={48}
                height={48}
                className="rounded-full"
              />
            </Avatar>
          )}
          <div className="ml-2">
            <div className="flex items-center">
              <p className="font-bold">{post?.user?.name}</p>
              <p className="pl-1 text-xs text-gray-500">{}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <MoreHorizontalIcon size="1.5rem" />
        </div>
      </div>

      <div className="overflow-hidden py-5" ref={emblaRef}>
        <div className="flex">
          {post?.image.map((src, index) => (
            <div className="relative w-full" key={index}>
              <img
                src={src}
                alt={`Slide ${index}`}
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="mt-4 flex items-center p-2">
          <ThumbsUpIcon
            color={isLiked || hasLiked ? "red" : "gray"}
            size="1.5rem"
            onClick={() => handleLikeClick(post?.id as string, hasLiked)}
          />
          <span className="text-sm text-gray-500">{likeCount}</span>
        </div>
        <div className="mt-4 flex items-center p-2">
          <Link href={`/post/${post?.id as string}`}>
            <MessageCircle size="1.5rem" />
            <span className="text-sm text-gray-500">
              {post?._count.comments}
            </span>
          </Link>
        </div>
      </div>
      <div className="flex">
        <p>
          {post?.comments.map((comment) => (
            <div key={comment.id}>
              <p>{comment.content}</p>
            </div>
          ))}
        </p>
      </div>
    </div>
  );
});


const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  if (!id) {
    return null;
  }

  const post = api.post.findOne.useQuery({ id: id as string });

  if (!post.data) {
    return null;
  }
  if (post.isFetching) return <PostSkeleton />

  return <div>
    <Post post={post.data} />
  </div>;
};

export default Index;
