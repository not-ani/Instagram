import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  !id && router.push("/");

  const post = api.post.findOne.useQuery({ id: id as string });

  if (!post.data) {
    return null;
  }

  return (
  );
};

export default Index;
