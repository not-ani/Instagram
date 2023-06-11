/* eslint-disable @typescript-eslint/no-misused-promises */
import { Heart, Home, PlusSquare, User } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import Switcher from "./Color";

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
                <Link href={`/profile/${sessionData.user.id}`}>
                    <User />
                </Link>
            ) : (
                <Button onClick={() => signIn().catch()}>Login</Button>
            )}
        </footer>
    );
};
