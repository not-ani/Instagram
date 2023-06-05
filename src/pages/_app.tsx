import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import "@uploadthing/react/styles.css";
import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteFooter } from "@/components/site-footer";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster />
      <SiteFooter />

    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
