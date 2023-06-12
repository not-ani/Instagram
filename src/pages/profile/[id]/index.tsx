"use client";
import Image from "next/image";
import { api } from "@/utils/api";
import { useScrollPosition } from "@/utils/hooks";
import { Menu } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
const LIMIT = 12;

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const user = api.user.findOne.useQuery({
    where: {
      id: id as string,
    },
  });
  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    api.user.findImages.useInfiniteQuery(
      {
        where: {
          userId: id as string,
        },
        limit: LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const images = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage().catch((error) => {
        console.log(error);
      });
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <div className="flex flex-col py-10">
      <div className="flex justify-around">
        <div></div>
        <h4 className="text-2xl font-bold">{user.data?.name}</h4>
        <Menu size={28} />
      </div>
      <div className="flex items-center justify-around gap-2 py-5 sm:gap-10 ">
        <Avatar className="h-20 w-20 sm:h-32 sm:w-32">
          <AvatarImage>{user.data?.image}</AvatarImage>
          <AvatarFallback>{user.data?.name}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="font-bold">Posts</h3>
          <p>{user.data?._count.posts}</p>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold">Likes</h3>
          <p>{user.data?._count.likes}</p>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold">Comments</h3>
          <p>{user.data?._count.comments}</p>
        </div>
      </div>
      <div className="flex flex-col justify-around px-10">
        <p className="font-bold">{user.data?.name}</p>
        <p>
          Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint
          cillum sint consectetur cupidatat.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1  px-10 py-20 sm:grid-cols-5 md:grid-cols-6">
        {images.map((item, index) => (
          <div key={index}>
            {item.image.map((src, idx) => (
              <div
                key={idx}
                className="relative h-20 overflow-hidden md:h-40 lg:h-60"
              >
                <Link href={`/post/${item.id}`}>
                  <Image
                    src={src}
                    className="outline outline-1 outline-white"
                    alt={`Image ${idx + 1}`}
                    priority
                    fill
                  />
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
