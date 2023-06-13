/* eslint-disable @next/next/no-img-element */
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { type OurFileRouter } from "@/server/uploadthing";
import { UploadButton } from "@uploadthing/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { HoverCardContent } from "@radix-ui/react-hover-card";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import LoginRequiredPage from "@/components/Login";

const formSchema = z.object({
  title: z.string().min(1).max(100).default("Untitled Post"),
  content: z.string().min(1).max(1000).optional(),
  published: z.boolean().default(false),
});

const Create = () => {
  const { toast } = useToast();
  const [image, setImage] = React.useState<string[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const { data: sessionData } = useSession();
  const [canUpload, setCanUpload] = React.useState<boolean>(false);

  const { mutate } = api.post.create.useMutation({
    onSuccess: () => {
      setImage([]);
      setCanUpload(false);

      toast({
        title: "Success",
        description: "your post has successfully created",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Look like there was an error",
      });
    },
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate({
      title: data.title,
      content: data.content,
      published: data.published,
      image: image,
    });
  }

  return (
    <div>
      {sessionData?.user ? (
        <div className="p-20">
          <Card className="p-5">
            <CardHeader>
              <h1 className="text-5xl font-bold">Create </h1>
            </CardHeader>
            <Form {...form}>
              <form
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Untitled Post" {...field} />
                      </FormControl>
                      <FormDescription>
                        The publicly visible name for your post.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Published?</FormLabel>
                        <FormDescription>
                          Is this post publicly visible?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <UploadButton<OurFileRouter>
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    const urls = res?.map((file) => file.fileUrl) as string[];

                    setImage((prevImage) => [...prevImage, ...urls]);
                    setCanUpload(true);

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    emblaApi.reInit();
                    console.log(image);
                    toast({
                      title: `success`,
                      description: `image uploaded you can now create a post`,
                    });
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    toast({
                      title: `error`,
                      description: error.message,
                    });
                  }}
                />

                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {image.map((src, index) => (
                      <div className="relative w-full" key={index}>
                        <img
                          src={src}
                          alt={`Slide ${index}`}
                          className="w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {canUpload ? (
                  <Button className="w-full" type="submit">
                    Submit
                  </Button>
                ) : (
                  <HoverCard>
                    <HoverCardTrigger>
                      <Button disabled className="w-full" type="submit">
                        Submit
                      </Button>
                    </HoverCardTrigger>

                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage src="/logo.svg" />
                          <AvatarFallback>VC</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">
                            <p>You cannot make a post yet</p>
                          </h4>
                          <p className="text-sm">
                            You must upload an image before you can make a post.
                          </p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </form>
            </Form>
          </Card>
        </div>
      ) : (
        <div>
          <LoginRequiredPage />
        </div>
      )}
    </div>
  );
};

export default Create;
