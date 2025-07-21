"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export async function syncUser() {
    try {
        const { userId } = await auth()  // this is clerk userid which we store as clerk id
        const user = await currentUser()
        if (!user || !userId) {
            return
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })
        if (existingUser) {
            return
        }

        const User = await prisma.user.create({
            data: {
                clerkId: userId,
                email: user.emailAddresses[0].emailAddress,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                image: user.imageUrl
            }
        })

        revalidatePath("/")

        return User
    } catch (error) {
        console.log("Error while syncing user with the database")
    }




}


export async function getUserByClerkId(clerkId: string) {
    return await prisma.user.findUnique({
        where: {
            clerkId,
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true
                }
            }
        }
    })
}

export async function getUserId() {
    const { userId } = await auth()  // this is clerk userid which we store as clerk id
    const currentuser = await currentUser()
    if (!currentuser || !userId) {
        return
    }
    if (!userId) {
        return
    }
    const user = await getUserByClerkId(userId)

    if (!user) {
        return null;
    }
    return user.id
}


export async function getRandomUsers() {
    try {
        const userid = await getUserId()
        if(!userid){
            return []
        }

        // get random users excluding current user and users that the current user follows

        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        NOT:
                        {
                            id: userid
                        }
                    },
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userid
                                }
                            }
                        }   //  this checks that if atleast one of the followerid in followers is userid and then  negates it
                    }
                ]
            },
            select: {
                id: true,
                image: true,
                username: true,
                name: true,
                _count: {
                    select: {
                        followers: true
                    }
                }
            },
            take: 3   // limits number of users fetched  to 3
        })
        return randomUsers

    } catch (error) {
        console.log("Error fetching random users to follow")
    }
}


export async function togglefollow(targetUserId: string) {

    try {
        const userId = await getUserId()
        if (!userId) {
            return {success:false}
        }

        if (userId === targetUserId) throw new Error("You cannot follow yourself");
        const isfollowing = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId
                }
            }
        }
        )

        if (isfollowing) {
            // unfollow

            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId
                    }
                }
            })
        }
        else {
            //follow

            await prisma.$transaction([
                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId,
                        creatorId: userId
                    }
                }),
                prisma.follows.create({
                    data: {
                        followerId: userId,
                        followingId: targetUserId
                    }
                })
            ])
            // in a transaction either all are successul or all faill

        }
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false, error: "Error toggling follow" };
    }

}


