"use server"


import { prisma } from "@/lib/prisma"
import { getUserId } from "./user.actions"
import { revalidatePath } from "next/cache"



export async function getchildrenComments(commentid: string) {
    const children = await prisma.comment.findMany({
        where: { parentId: commentid },
        include: {
            author: {
                select: {
                    image: true,
                    name: true,
                    username: true
                }
            }
        },
        orderBy: { createdAt: "asc" }
    })



    return children

}
export async function createchildComment(postId: string, parentId: string, content: string) {
    try {
        const userId = await getUserId()
        if (!userId) {
            throw new Error("Unauthorized User")
        }

        if (!content) {
            throw new Error("Content is required")
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                authorId: userId,
                postId,
                parentId
            }
        })
        return { success: true, comment };
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
}
