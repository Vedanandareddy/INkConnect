"use client"
import { createComment, deletPost, getPosts, toggleLike } from "@/actions/post.actions"
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";

type Posts = NonNullable<Awaited<ReturnType<typeof getPosts>>>
type Post = Posts[number]

function PostCard({ post, userId }: { post: Post; userId: string | null | undefined }) {
  const { user } = useUser()

  const [newComment, setnewComment] = useState("")
  const [isCommenting, setisCommenting] = useState(false)
  const [isDeleting, setisDeleting] = useState(false)
  const [hasLiked, sethasLiked] = useState(post.likes.some((like) => (like.userId === userId)))
  const [isLiking, setisLiking] = useState(false)
  const [optimisticLikes, setoptimisticLikes] = useState(post._count.likes)
  const [showComments, setshowComments] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    try {
      setisLiking(true)
      sethasLiked(!hasLiked)
      setoptimisticLikes((prev) => prev + (hasLiked ? -1 : 1))  // hasLiked doesnot update immediately so we get previous value
      await toggleLike(post.id)
    } catch (error) {
      setoptimisticLikes(post._count.likes);
      sethasLiked(post.likes.some((like) => like.userId === userId));
    } finally {
      setisLiking(false);
    }
  }

  const handleComment = async () => {
    if (isCommenting) return
    try {
      setisCommenting(true)
      if (!newComment.trim()) {
        toast.error("Invalid comment")
      }
      const response = await createComment(post.id, newComment.trim())
      if (!response.success) {
        throw new Error("Error while adding comment")
      }
      toast.success("Comment added succesfully")
      setnewComment("");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setisCommenting(false);
    }
  }

  const handleDeletePost = async () => {
    if (isDeleting) return
    try {
      setisDeleting(true)
      const response = await deletPost(post.id)
      if (!response.success) {
        throw new Error("Error while deleting the post")
      }
      toast.success("Succesfully Deleted Post")
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setisDeleting(false);
    }
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">

          <div className="flex space-x-3 sm:space-x-4">

            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">

                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>

                </div>
                {/* Check if current user is the post author */}
                {userId === post.authorId && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}

              </div>

              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>

            </div>
          </div>



          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (


              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                  }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>


            ) : (


              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>


            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setshowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>





          {/* COMMENTS SECTION */}


          {showComments && (

            <div className="space-y-4 pt-4 border-t">

              {user ? (
                <div className="flex space-x-3">


                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>

                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setnewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}
                      >
                        {isCommenting ? (
                          "Posting..."
                        ) : (
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


                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>


              )}




              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 items-start">
                    <Avatar className="size-8 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                    </Avatar>

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>

                      </div>

                      <p className="text-sm break-words">{comment.content}</p>

                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PostCard

