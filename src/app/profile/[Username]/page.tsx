import { getLikedPosts, getProfileByUsername, getUserPosts, isFollowing } from "@/actions/profile.actions"
import { notFound } from "next/navigation"
import ProfileClientPage from "./ProfileClientPage"
import { getUserId } from "@/actions/user.actions"

export async function generateMetadata({ params }: { params: Promise<{ Username: string }> }) {
  const { Username } = await params
  const user = await getProfileByUsername(Username)
  if (!user) {
    return
  }
  return {
    title: `${user.name ?? user.username}`,
    description: "Profile Page"
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ Username: string }> }) {

  const { Username } = await params
  const user = await getProfileByUsername(Username)
  if (!user) {
    notFound()
  }

  const CurrentUserId=await getUserId()


  const [userPosts,likedPosts,isfollowing]=await Promise.all([
     getUserPosts(user.id),
     getLikedPosts(user.id),
     isFollowing(user.id)
  ])

  return (
    <ProfileClientPage user={user} posts={userPosts} likedposts={likedPosts} CurrentUserId={CurrentUserId}  isfollowing={isfollowing} />
  )
}

