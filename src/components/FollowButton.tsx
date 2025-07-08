"use client"
import { useState } from "react";
import { Button } from "./ui/button";
import { togglefollow } from "@/actions/user.actions";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";


export default function FollowButton({ userId }: { userId: string }) {
    const [loading, setloading] = useState(false)

    const handlefollow = async () => {
        setloading(true)
        try {
            const response = await togglefollow(userId)
            if(!response.success){
                throw new Error("Failed to follow user")
            }

            toast.success("Following User")
        } catch (error) {
            toast.error("Error following user")
        } finally {
            setloading(false)
        }
    }

    return (
        <Button size={"sm"} onClick={handlefollow} disabled={loading}
            className="w-20" variant={"secondary"}> {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"} </Button>
    )
}
