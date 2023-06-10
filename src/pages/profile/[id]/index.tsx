"use client";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  if (!id) {
    return null;
  }

  // const data = api.user

  return <div></div>;
};

export default Index;
