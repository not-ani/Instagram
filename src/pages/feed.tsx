import { RouterInputs, RouterOutputs, api } from "@/utils/api";
import Image from "next/image";
import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MoreHorizontalIcon,
  MoreVertical,
  MoreVerticalIcon,
  ThumbsUpIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (winScroll / height) * 100;
    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
}

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

      console.log(`
                this  ${value}
            `);

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

  const [likeCount, setLikeCount] = useState(post._count.likes);
  const likeMutation = api.post.like.useMutation({
    onSuccess: (data, variables) => {
      const userId = data.userId as string;
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
      updateCache({ client, data: userId, variables, input, action: "unlike" });
      toast({
        title: "Unliked",
        description: "You unliked this post",
        duration: 3000,
      });
    },
  }).mutateAsync;

  const hasLiked = post.likes.length > 0;

  /**
                                              return (
                                                  <Card className='p-10 outline'>
                                                      <div className="flex p-2">
                                                          <CardHeader>
                                                              <div className="flex flex-col">
                                                                  {post.user?.image && (
                                                                      <Image
                                                                          src={post.user?.image}
                                                                          alt={`${post.user?.name} profile picture`}
                                                                          width={48}
                                                                          height={48}
                                                                          className="rounded-full"
                                                                      />
                                                                  )}
                                                              </div>
                                                          </CardHeader>
                                          
                                                          <CardContent>
                                                              <div className="ml-2">
                                                                  <div className="flex items-center">
                                                                      <p className="font-bold">
                                                                          <Link href={`/${post.user?.name}`}>{post.user?.name}</Link>
                                                                      </p>
                                                                      <p className="pl-1 text-xs text-gray-500">
                                                                      </p>
                                                                  </div>
                                          
                                                                  <div>{post.content}</div>
                                                              </div>
                                                          </CardContent>
                                                      </div>
                                                      <CardFooter>
                                          
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
                                                      </CardFooter>
                                                  </Card>
                                              );
                                              */

  const handleLikeClick = (postId: string, hasLiked: boolean) => {
    // Optimistically update the like count
    setLikeCount(likeCount + (hasLiked ? -1 : 1));

    if (hasLiked) {
      unlikeMutation({ postId });
      return;
    }

    likeMutation({ postId });
  };
  return (
    <div className="flex flex-col p-10 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {post.user?.image && (
            <Avatar>
              <Image
                src={post.user?.image}
                alt={`${post.user?.name} profile picture`}
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
        <div className="flex items-center">
          <MoreHorizontalIcon size="1.5rem" />
        </div>
      </div>
      <div className="absolute w-full">
        {post.image.length > 1 ? (
          <div className="flex flex-col"></div>
        ) : (
          <Image
            src={post.image[0]}
            fill={true}
            alt={`${post.user?.name} post`}
          />
        )}
      </div>

      <div className="mt-4 flex items-center p-2">
        <ThumbsUpIcon
          color={hasLiked ? "red" : "gray"}
          size="1.5rem"
          onClick={() => handleLikeClick(post.id, hasLiked)}
        />
        <span className="text-sm text-gray-500">{post._count.likes}</span>
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
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);
  return (
    <div>
      <ScrollArea>
        <div className="w-full border-l-2 border-r-2 border-t-2 border-gray-500 md:p-20">
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
