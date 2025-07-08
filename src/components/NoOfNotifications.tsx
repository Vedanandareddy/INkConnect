"use client"

import { getNoOfUnreadNotifications } from "@/actions/notifications.actions"
import { useEffect, useState } from "react"

function NoOfNotifications({notificationCount}:{notificationCount:number|undefined}) {

    const [notifications, setnotifications] = useState<number|undefined>(0)

    useEffect(() => {
            setnotifications(notificationCount)

    },[notificationCount])



    return (
        <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
            {notifications??"0"}
        </div>
    )
}

export default NoOfNotifications
