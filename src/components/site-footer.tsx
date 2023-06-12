/* eslint-disable @typescript-eslint/no-misused-promises */
import { Heart, Home, LogOut, PlusSquare, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import Switcher from "./Color";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const SiteFooter = () => {
  const { data: sessionData } = useSession();
  return (
    <footer className="fixed bottom-0 left-0 flex w-screen justify-evenly bg-background py-5">
      <Link href="/feed">
        <Home />
      </Link>
      <Switcher />

      <Link href="/post/create">
        <PlusSquare />
      </Link>

      <Link href="/activity">
        <Heart />
      </Link>

      {sessionData?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage>{sessionData.user.image}</AvatarImage>
              <AvatarFallback>{sessionData.user.name}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <Link href={`/profile/${sessionData.user.id}`}>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator></DropdownMenuSeparator>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  signOut().catch((error) => {
                    console.log(error);
                  })
                }
              >
                <LogOut />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={() => signIn().catch()}>Login</Button>
      )}
    </footer>
  );
};
