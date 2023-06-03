import React from 'react'
import {
    inferProcedureOutput
} from '@trpc/server'
import type { AppRouter } from '../server/api/root'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { api } from '@/utils/api'
import { Session } from 'next-auth'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Switch } from './ui/switch'
import { useToast } from './ui/use-toast'


const PostCard: React.FC<{
    post: inferProcedureOutput<AppRouter["post"]["findOne"]>
    isDrafts: boolean
    sessionData: Session
}> = ({ post, sessionData, isDrafts }) => {
    const { toast } = useToast()
    if (!post) {
        return null
    }
    const [checked, setChecked] = React.useState<boolean>(post?.published)

    const makePublic = api.post.updatePublished.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "your post has successfully updated"
            })
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Look like there was an error"
            })
        }



    })


    function onChange() {
        setChecked(true);
        makePublic.mutate({
            id: String(post?.id),
            published: true
        });
    }
    const { mutate } = api.post.delete.useMutation()

    if (!post) {
        return null
    }

    function onDelete() {
        mutate({
            id: String(post?.id)
        })
    }
    return (
        <div className="py-5">

            <Card>
                <CardHeader>
                    <div className="flex justify-between">
                        <Avatar>
                            <AvatarImage src={String(post?.user?.image)} />
                            <AvatarFallback>{post?.user?.name[0]}</AvatarFallback>
                        </Avatar>

                        <CardTitle className='text-3xl'>{post?.title}</CardTitle>

                    </div>
                </CardHeader>
                <CardContent>

                </CardContent>
                {

                    sessionData.user.id === post?.userId ? (
                        <CardFooter>
                            <div className="flex justify-between">
                                <Button
                                    onClick={() => onDelete()}
                                > Delete </Button>

                                {
                                    isDrafts ? (

                                        <Switch
                                            checked={checked}
                                            onCheckedChange={onChange}
                                        />


                                    ) : null
                                }
                            </div>


                        </CardFooter>

                    ) : null


                }

            </Card>
        </div>
    )
}

export default PostCard
