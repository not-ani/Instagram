"use client";
import Image from "next/image";
import { api } from "@/utils/api";
import { useScrollPosition } from "@/utils/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
const LIMIT = 20;

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

  const client = useQueryClient();

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
        <Menu size={32} />
      </div>
      <div></div>

      <div className="grid grid-cols-3 gap-1  p-20 sm:grid-cols-5 md:grid-cols-6">
        {images.map((item, index) => (
          <div key={index}>
            {item.image.map((src, idx) => (
              <div
                key={idx}
                className="relative h-20 overflow-hidden md:h-40 lg:h-60"
              >
                <Image
                  src={src}
                  className="outline outline-1 outline-white"
                  alt={`Image ${idx + 1}`}
                  fill
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
