import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/utils/api'
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'

const Drafts = () => {

    const { data: sessionData } = useSession();
    const { toast } = useToast();
    const [page, setPage] = useState(0);
    const { mutate } = api.post.deleteMany.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "all your drafts has been deleted"
            })
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Look like there was an error"
            })

        }
    })


    const { data, fetchNextPage, isLoading } = api.post.findUnPublished.useInfiniteQuery(
        {
            limit: 5,
            userId: String(sessionData?.user.id),
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const handleFetchNextPage = () => {
        fetchNextPage();
        setPage((prev) => prev + 1);
    };

    const handleFetchPreviousPage = () => {
        setPage((prev) => prev - 1);
    };


    return (
        <div className='p-20'>
            <Card>
                <CardHeader>
                    <div className="flex justify-between"> 
                        <h1 className="text-2xl font-bold">Drafts</h1> 
                        <Button
                            variant="destructive"
                          onClick={() => mutate({
                               where: {
                                    published: false,
                                    userId: String(sessionData?.user.id)
                                }
                            })}
                        >
                            Delete All 
                        </Button>

                    </div>
               </CardHeader>
                <CardContent className='p-5'>
                   {
                        data?.pages[page]?.items.map((post) => (
                            <PostCard   isDrafts={true} post={post} sessionData={sessionData} key={post.id} />
                        ))
                    }
                </CardContent>
                <CardFooter className='justify-between'>
                    <Button
                        variant="secondary"
                        onClick={handleFetchPreviousPage}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleFetchNextPage}
                        disabled={isLoading || !data?.pages[page]?.nextCursor}
                    >
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Drafts
