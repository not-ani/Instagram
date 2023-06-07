import { Heart, Home, PlusSquare, Search, User } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

export const SiteFooter = () => {
    const { data: sessionData  } = useSession()
    return (
        <footer className="py-5 fixed bottom-0 left-0 w-screen bg-background flex justify-evenly">
            <Link href="/feed">
                <Home />
            </Link>
            <Link href="/search">
                <Search />
            </Link>

            <Link href="/post/create">
                <PlusSquare />
            </Link>

            <Link href="/activity">
                <Heart />
            </Link>

            {
                    sessionData?.user ? (
                        <Link href={`/profile/${sessionData.user.id}`}>
                            <User />
                        </Link>
                    ) : (
                            <Button onClick={() => signIn()}>Login</Button>
                    )


                }
        </footer>

    )
}

