"use client"

import React, { useEffect, useState } from 'react'

interface Task {
    id: number,
    title: string,
    completed: boolean
}

function TaskPage() {

    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        async function fetchtasks() {
            const data=await fetch("http://localhost:3000/api/tasks")
            setTasks(await data.json())

        }
        fetchtasks()
    }, [])

  return (
    <div>
    <div>{tasks.map((task)=>(
        <div key={task.id}>{task.title}</div>
    ))}</div>
    </div>
  )
}

export default TaskPage
