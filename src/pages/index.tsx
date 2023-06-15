/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
import { type RouterInputs, type RouterOutputs, api } from "@/utils/api";
import Image from "next/image";
import {
  type InfiniteData,
  type QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, MoreHorizontalIcon, ThumbsUpIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import useEmblaCarousel from "embla-carousel-react";
import { useScrollPosition } from "@/utils/hooks";

const LIMIT = 6;

function updateCache({
  client,
  variables,
  data,
  action,
  input,
}: {
  client: QueryClient;
  input: RouterInputs["post"]["timeline"];
  variables: {
    postId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
}) {
  client.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      if (!oldData) {
        // Handle the case where oldData is undefined.
        // For example, you could return an initial state.
        return {
          pages: [],
          pageParams: [],
        };
      }
      const newData = oldData as InfiniteData<
        RouterOutputs["post"]["timeline"]
      >;

      const value = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          posts: page.posts.map((post) => {
            if (post.id === variables.postId) {
              return {
                ...post,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: post._count.likes + value,
                },
              };
            }

            return post;
          }),
        };
      });

      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
}

const Post = React.memo(function Post({
  post,
  client,
  input,
}: {
  post: RouterOutputs["post"]["timeline"]["posts"][number];
  client: QueryClient;
  input: RouterInputs["post"]["timeline"];
}) {
  const { toast } = useToast();

  const [emblaRef] = useEmblaCarousel({ loop: false });
  const likeMutation = api.post.like.useMutation({
    onSuccess: (data, variables) => {
      const userId = data.userId as string;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      updateCache({ client, data: userId, variables, input, action: "like" });
      toast({
        title: "Liked",
        description: "You liked this post",
        duration: 3000,
      });
    },
  }).mutateAsync;
  const unlikeMutation = api.post.unlike.useMutation({
    onSuccess: (data, variables) => {
      const userId = data.userId as string;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      updateCache({ client, data: userId, variables, input, action: "unlike" });
      toast({
        title: "Unliked",
        description: "You unliked this post",
        duration: 3000,
      });
    },
  }).mutateAsync;

  const hasLiked = post.likes.length > 0;
  return (
    <div className="flex flex-col p-10 ">
      <div className="flex items-center justify-between">
        <Link href={`/profile/${post.user?.id as string}`}>
          <div className="flex items-center">
            {post.user?.image && (
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
                <p className="font-bold">{post.user?.name}</p>
                <p className="pl-1 text-xs text-gray-500">{}</p>
              </div>
            </div>
          </div>
        </Link>
        <div className="flex items-center">
          <MoreHorizontalIcon size="1.5rem" />
        </div>
      </div>

      <div className="overflow-hidden py-5" ref={emblaRef}>
        <div className="flex">
          {post.image.map((src, index) => (
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
            color={hasLiked ? "red" : "gray"}
            size="1.5rem"
            onClick={() => {
              if (hasLiked) {
                unlikeMutation({
                  postId: post.id,
                });
                return;
              }

              likeMutation({
                postId: post.id,
              });
            }}
          />
          <span className="text-sm text-gray-500">{post._count.likes}</span>
        </div>
        <div className="mt-4 flex items-center p-2">
          <Link href={`/post/${post.id}`}>
            <MessageCircle size="1.5rem" />
            <span className="text-sm text-gray-500">
              {post._count.comments}
            </span>
          </Link>
        </div>
      </div>
      <div className="flex">
        <p>
          {post.comments.map((comment) => (
            <div key={comment.id}>
              <p>{comment.content}</p>
              <p>{comment.user?.name}</p>
            </div>
          ))}
        </p>
      </div>
    </div>
  );
});
export function Timeline({
  where = {},
}: {
  where: RouterInputs["post"]["timeline"]["where"];
}) {
  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    api.post.timeline.useInfiniteQuery(
      {
        where: {
          published: true,
        },
        limit: LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const client = useQueryClient();

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage().catch((error) => {
        console.log(error);
      });
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);
  return (
    <div>
      <ScrollArea>
        <div className="w-full border-l-2 border-r-2 border-t-2 border-gray-500 md:p-20">
          {
            isFetching && (<div>
              {
                // display the post skeleton a set number fo times 
                Array(3).fill(0).map((_, index) => <PostSkeleton key={index} />)
              }
            </div>
            )
          }
          {posts.map((post) => {
            return (
              <Post
                key={post.id}
                post={post}
                client={client}
                input={{
                  where,
                  limit: LIMIT,
                }}
              />


            );
          })}

          {!hasNextPage && <p>No more items to load</p>}
        </div>
      </ScrollArea>
    </div>
  );
}

export default Timeline;
