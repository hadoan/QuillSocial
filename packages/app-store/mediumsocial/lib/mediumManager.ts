import axios from "axios";
import prisma from "@quillsocial/prisma";
import { mediumCredentialSchema } from "./mediumCredentialSchema";


export const post = async (postId: number) => {
    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post || !post.credentialId) return false;
        const credential = await prisma.credential.findUnique({ where: { id: post.credentialId } });

        if (!credential) {
            await prisma.post.update({ where: { id: post.id }, data: { status: "ERROR" } });
            return false;
        }
        const mediumCredential = mediumCredentialSchema.parse(credential.key);
        const response = await publishPost(mediumCredential.integrationToken, mediumCredential.id, post.title!, post.content, post.tagOrKeywords?.split(",") ?? []);

        if (!response) {
            await prisma.post.update({ where: { id: post.id }, data: { status: "ERROR" } });
            return false;
        } else {
            await prisma.post.update({
                where: { id: post.id },
                data: {
                    status: "POSTED", postedDate: new Date(), result: {
                        shareId: response,
                    }
                },
            });
            return true;
        }
    } catch (error) {
        await prisma.post.update({ where: { id: postId }, data: { status: "ERROR" } });
        console.error(error);
        return false;
    }
};


const publishPost = async (accessToken: string, publicationOrUserId: string, title: string, content: string, tags: string[], isPublication = false) => {
    const apiUrl = !isPublication ? `https://api.medium.com/v1/users/${publicationOrUserId}/posts`
        : `https://api.medium.com/v1/publications/${publicationOrUserId}/posts`;

    const postPayload = {
        title,
        contentFormat: 'html',
        content,
        publishStatus: 'public',
    };
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        AcceptCharset: 'utf-8',
        Authorization: `Bearer ${accessToken}`,
    };

    try {
        const response = await axios.post(apiUrl, postPayload, { headers });
        // console.log('Post published successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error publishing post:', error.response ? error.response.data : error.message);
        return null;
    }
};