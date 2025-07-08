"use server"

import { prisma } from "@/lib/prisma"
import { getUserId } from "./user.actions"
import { revalidatePath } from "next/cache"


export async function getNotifications() {
    try {
        const userId = await getUserId()
        if (!userId) {
            return []
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId,
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                        id: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                        image: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc", // newest notification first
            }
        })
        return notifications
    } catch (error) {

    }

}



export async function markAsRead(notificationids: string[]) {
    try {
        const userId = await getUserId()
        if (!userId) {
            return
        }
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationids
                }
            },
            data: {
                read: true
            }
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return { success: false };
    }
}


export async function getNoOfUnreadNotifications() {
    try {
        const userId = await getUserId()
        if (!userId) {
            return
        }
        const unreadnotifications=await prisma.notification.findMany({
            where: {
                userId,
                read: false
            }
        })
        revalidatePath("/")
        return unreadnotifications.length
    } catch (error) {
        console.error("Error getting unread  notifications :", error);
        return 0;
    }
}
