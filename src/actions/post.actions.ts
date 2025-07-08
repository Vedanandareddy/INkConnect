"use server"

import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";
import { revalidatePath } from "next/cache";


export async function createPost(content: string, image: string) {
    try {
        const userId = await getUserId();

        if (!userId) return;

        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorId: userId,
            },
        });

        revalidatePath("/")

        // if page is generated statically it caches the data and revalidates it after set time
        // by using revalidatePath("/") it revalidates after an event and fetches the latest posts

        return { success: true, post };
    } catch (error) {
        console.error("Failed to create post:", error);
        return { success: false, error: "Failed to create post" };
    }
}


export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: "desc"  // new posts first
            },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true,
                        image: true
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                comments: {
                    orderBy: { createdAt: "asc" },  // old comments first
                    include: {
                        author: {
                            select: {
                                name: true,
                                username: true,
                                image: true,
                            }
                        }
                    }

                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
        })

        if (!posts) {
            return []
        }
        return posts
    } catch (error) {
        console.log("Error getting posts", error)
    }

}


export async function toggleLike(postId: string) {
    try {
        const userId = await getUserId()
        if (!userId) {
            throw new Error("Unauthorized User")
        }
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    postId,
                    userId
                }
            }
        })

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            throw new Error("Invalid Post")
        }


        if (existingLike) {
            // unlike
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        postId,
                        userId
                    }
                }
            })

        }
        else {
            // like and  create notification only if liking someone else's post
            await prisma.$transaction([
                prisma.like.create({
                    data: {
                        userId,
                        postId
                    },

                }),
                ...(post.authorId !== userId
                    ? [prisma.notification.create({
                        data: {
                            type: "LIKE",
                            creatorId: userId,
                            userId: post.authorId,
                            postId
                        }
                    })]
                    : [])
            ])
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.log("Error toggling like", error)
        return { success: false, error: "Failed to toggle like" };
    }

}


export async function createComment(postId: string, content: string) {
    try {
        const userId = await getUserId()
        if (!userId) {
            throw new Error("Unauthorized User")
        }

        if (!content) {
            throw new Error("Content is required")
        }
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            throw new Error("No post found")
        }

        // create a comment and notification if the comment author and post author are different
        const [comment] = await prisma.$transaction(async (tx) => {
            const newComment = await tx.comment.create({
                data: {
                    content,
                    authorId: userId,
                    postId,

                }
            })

            if (userId !== post.authorId) {
                await tx.notification.create({
                    data: {
                        type: "COMMENT",
                        creatorId: userId,
                        userId: post.authorId,
                        commentId: newComment.id,
                        postId,

                    }
                })
            }
            return [newComment]
        })
        revalidatePath("/")
        return { success: true, comment };
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
}


export async function deletPost(postId: string) {
    try {
        const userId = await getUserId()
        if (!userId) {
            throw new Error("Unauthorized User")
        }

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            },
            select: { authorId: true }
        })

        if (!postId) {
            throw new Error("Invalid Post")
        }

        if (post?.authorId !== userId) {
            throw new Error("Not authorized to delete this post")
        }

        await prisma.post.delete({
            where: {
                id: postId
            }
        })

        revalidatePath("/")
        return { success: true };
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { success: false, error: "Failed to delete post" };
    }
}

