/** server/uploadthing.ts */
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getServerAuthSession } from "./auth";
import { type NextApiRequest, type NextApiResponse } from "next";
const f = createUploadthing();

function auth(req: NextApiRequest, res: NextApiResponse) {
    const session = getServerAuthSession({ req, res });
    return session;
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f
        // Set permissions and file types for this FileRoute
        .fileTypes(["image"])
        .maxSize("32MB")
        .middleware(async (req, res) => {
            // This code runs on your server before upload
            const session = await auth(req, res);
            const user = session?.user;

            // If you throw, the user will not be able to upload
            if (!user) throw new Error("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.id };
        })
        // eslint-disable-next-line @typescript-eslint/require-await
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);

            console.log("file url", file.url);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
