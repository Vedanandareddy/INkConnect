"use client"
import { useEffect, useState } from "react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { createchildComment, getchildrenComments } from "@/actions/comment.actions"
import { Button } from "./ui/button"
import { LogInIcon, MessageSquareReply, Reply, SendIcon } from "lucide-react"
import { SignInButton, useUser } from "@clerk/nextjs"
import { Textarea } from "./ui/textarea"
import toast from "react-hot-toast"

type Comments = Awaited<ReturnType<typeof getchildrenComments>>
type Comment = Comments[number]

export default function CommentComponent({ comment }: { comment: Comment }) {
    const { user } = useUser()
    const [replyText, setReplyText] = useState("")
    const [isCommenting, setIsCommenting] = useState(false)
    const [showReplies, setShowReplies] = useState(false)
    const [showReplyBox, setShowReplyBox] = useState(false)
    const [childComments, setChildComments] = useState<Comment[]>([])

    useEffect(() => {
        async function fetchChildren() {
            const children = await getchildrenComments(comment.id)
            setChildComments(children)
        }
        fetchChildren()
    }, [comment.id])




    const handleComment = async () => {
        if (!user) return

        if (!replyText.trim()) {
            toast.error("Invalid comment")
            return
        }

        try {
            setIsCommenting(true)
            const result = await createchildComment(comment.postId, comment.id, replyText)
            if (!result.success) {
                throw new Error("Error while adding comment")
            }

            toast.success("Comment added successfully")
            setReplyText("")
            setShowReplyBox(false)
            setShowReplies(true)
            const refreshedChildren = await getchildrenComments(comment.id)
            setChildComments(refreshedChildren)
        } catch (error) {
            console.error("Error while commenting under a comment", error)
        } finally {
            setIsCommenting(false)
        }
    }

    return (
        <div className="border rounded-xl bg-background p-4 space-y-3 shadow-sm">
            {/* Header */}
            <div className="flex items-start space-x-3">
                <Avatar className="size-8">
                    <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                        <span className="font-medium">{comment.author.name}</span>
                        <span className="text-muted-foreground">@{comment.author.username}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                    </div>
                    <p className="text-sm mt-1 text-foreground">{comment.content}</p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4 text-sm text-muted-foreground">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyBox(!showReplyBox)}
                    className="gap-1"
                >
                    <Reply className="size-4" />
                    Reply
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                    className="gap-1"
                >
                    <MessageSquareReply className="size-4" />
                    {showReplies ? "Hide Replies" : "Show Replies"}
                </Button>
            </div>

            {/* Reply Box */}
            {showReplyBox && (
                <div className="border-t pt-4 mt-2">
                    {user ? (
                        <div className="flex space-x-3">
                            <Avatar className="size-8">
                                <AvatarImage src={user.imageUrl ?? "/avatar.png"} />
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder="Write your reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="min-h-[80px] resize-none bg-muted/40"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleComment}
                                        disabled={!replyText.trim() || isCommenting}
                                        className="gap-1"
                                    >
                                        {isCommenting ? "Posting..." : (
                                            <>
                                                <SendIcon className="size-4" />
                                                Comment
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center p-4 rounded-lg border bg-muted/50">
                            <SignInButton mode="modal">
                                <Button variant="outline" className="gap-2">
                                    <LogInIcon className="size-4" />
                                    Sign in to reply
                                </Button>
                            </SignInButton>
                        </div>
                    )}
                </div>
            )}

            {/* Child Comments */}
            {showReplies && (
                <div className="pl-6 mt-4 space-y-3 border-l-2 border-muted">
                    {childComments.map((child) => (
                        <CommentComponent key={child.id} comment={child} />
                    ))}
                </div>
            )}
        </div>
    )
}
