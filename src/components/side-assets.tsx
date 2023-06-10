"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

function Assets({
  type,
  className,
}: {
  className?: string;
  type: "icon" | "hero-image";
}) {
  const { theme: currentTheme } = useTheme();
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  return type === "icon" ? (
    <Image
      src={`/logo-${theme as string}.svg`}
      priority
      alt="logo"
      className={cn("h-8 w-auto", className)}
      width={"0"}
      height={"0"}
    />
  ) : null;
}

export default Assets;
