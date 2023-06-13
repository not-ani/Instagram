import Login from "@/components/Login";
import { useSession } from "next-auth/react";
import React from "react";

const Edit = () => {
  const { data: sessionData } = useSession();

  if (!sessionData?.user) {
    return (
      <div className="bg-background">
        <Login />
      </div>
    );
  }

  return <div></div>;
};

export default Edit;
