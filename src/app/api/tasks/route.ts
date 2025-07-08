import { NextResponse } from "next/server"

interface Task {
    id: number,
    title: string,
    completed: boolean
}

interface CreateTask {
    title: string
}

let tasks: Task[] = [
    { id: 1, title: "Learn Next.js", completed: false },
    { id: 2, title: "Build a project", completed: false },
]

export async function GET() {
    return Response.json(tasks)
}


export async function POST(req: Request) {
    try {
        const body: CreateTask = await req.json()
        if (!body.title) {
            return Response.json({ error: "Title is required" }, { status: 400 });
        }

        const NewTask: Task = {
            id: tasks.length + 1,
            title: body.title,
            completed: false
        }

        tasks.push(NewTask)
        return Response.json({ success: true }, { status: 200 })
    } catch (error) {
        return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

}


export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get("id") || "");


        if (!id) {
            return Response.json({ error: "Task ID is required" }, { status: 400 });
        }

        const taskIndex = tasks.findIndex((task) => task.id === id);
        if (taskIndex === -1) {
            return Response.json({ error: "Task not found" }, { status: 404 });
        }

        tasks = tasks.filter((task) => task.id !== id);
        return Response.json({ message: "Task deleted" });
    } catch (error) {
        return Response.json({ error: "Invalid request" }, { status: 400 });
    }
}
