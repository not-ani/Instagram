/* eslint-disable @typescript-eslint/no-misused-promises */
import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

// components/LoginRequiredPage.js
import Link from "next/link";
import Image from "next/image";

const LoginRequiredPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background ">
      <div className="flex space-x-8 rounded-md bg-background p-8 shadow-md outline">
        {/* Illustration Section */}
        <div className="hidden md:block">
          <Image
            src="/login.svg"
            alt="Illustration Description"
            width={400}
            height={400}
          />
        </div>

        {/* Login Form Section */}
        <div className="flex w-full flex-col justify-between md:w-96">
          <h2 className="mb-6 text-2xl font-semibold">Please Log In</h2>
          <Button className="w-full" onClick={() => signIn()}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredPage;
