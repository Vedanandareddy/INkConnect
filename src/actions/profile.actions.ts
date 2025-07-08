"use server"

import { prisma } from "@/lib/prisma"
import { tree } from "next/dist/build/templates/app-page"
import { notFound } from "next/navigation"
import { getUserId } from "./user.actions"
import { revalidatePath } from "next/cache"



export async function getProfileByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username
            },
            select: {
                id:true,
                name: true,
                location: true,
                username: true,
                image: true,
                bio: true,
                website: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            },
        })
        return user
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Failed to fetch profile");
    }

}

export async function getUserPosts(userId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        username: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                image: true,
                                name: true,
                                username: true
                            }
                        },
                    },
                    orderBy: { createdAt: "asc" }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }

            },
            orderBy: { createdAt: "desc" }
        })
        return posts
    } catch (error) {
        console.error("Error fetching user posts:", error);
        throw new Error("Failed to fetch user posts");
    }


}

export async function getLikedPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                // in the post we want check if the user has liked a post and get liked posts
                // so in the post likes we can if a like is done by userid we have now
                likes: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        username: true
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                image: true,
                                name: true,
                                username: true
                            }
                        },
                    },
                    orderBy: { createdAt: "asc" }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        return likedPosts;
    } catch (error) {
        console.error("Error fetching liked posts:", error);
        throw new Error("Failed to fetch liked posts");
    }
}


export async function updateProfile(formData: FormData) {

    try {
        const userId = await getUserId()
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                name,
                bio,
                location,
                website
            }
        })
        revalidatePath("/profile")
        return { success: true, user }
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}



export async function isFollowing(userId: string) {
    try {
        const currentId = await getUserId()
        if (!currentId) {
            return false
        }
        const follow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentId,
                    followingId: userId
                }
            }
        })
        return !!follow
        // !object converts object to boolean false and !!object makes it true if it exist but for null !null is true and !!null is false
    } catch (error) {
        console.error("Error checking follow status:", error);
        return false;
    }
}
