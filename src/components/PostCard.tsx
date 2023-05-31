import React from 'react'
import {
    inferProcedureOutput
} from '@trpc/server'
import type { AppRouter } from '../server/api/root'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { api } from '@/utils/api'
import { Session } from 'next-auth'
import { Button } from './ui/button'


const MeetingCard: React.FC<{
    post: inferProcedureOutput<AppRouter["post"]["findOne"]>
    sessionData: Session
}> = ({ post, sessionData }) => {

    const  { mutate } = api.post.delete.useMutation()

    if (!post) {
        return null
    }

    function onDelete() {
        mutate({
            id: String(post?.id)
        })
    }
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between">

                    <CardTitle>{post?.title}</CardTitle>

                </div>
            </CardHeader>
            <CardContent>
                <CardDescription>
                </CardDescription>
            </CardContent>
            <CardFooter>
                {
                    sessionData.user.id === post?.userId ? (
                        <Button
                            onClick={() => onDelete()}
                        > Delete </Button>
                    ) : null
                }
            </CardFooter>

        </Card>

    )
}

export default MeetingCard
