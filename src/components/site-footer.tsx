import { Heart, Home, PlusSquare, Search, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const SiteFooter = () => {
    return (
        <footer className="py-5 bg-background flex justify-evenly">
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

            <Link href="/profile/edit">
                <User />
            </Link>
        </footer>

    )
}

