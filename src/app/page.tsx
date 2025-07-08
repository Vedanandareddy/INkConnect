import { getPosts } from "@/actions/post.actions"
import { getUserId } from "@/actions/user.actions"
import CreatePost from "@/components/CreatePost"
import PostCard from "@/components/PostCard"
import WhoToFollowPage from "@/components/WhoToFollow"
import { currentUser } from "@clerk/nextjs/server"
import { Metadata } from "next"


export const metadata:Metadata={
  title:"INKCONNECT",
  description:"A Modern Social Media App"
}

export default async function page() {
  const user = await currentUser()
  const userId = await getUserId()

  const posts = await getPosts()

  if (!posts || posts.length === 0) {
    return <p>No posts available.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10">
      <div className=" lg:col-span-6 ">
        {user ? <CreatePost /> : null}
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} userId={userId} />
          ))}
        </div>
      </div>
      <div className=" hidden lg:block lg:col-span-4 mx-2"><WhoToFollowPage /></div>
    </div>
  )
}


