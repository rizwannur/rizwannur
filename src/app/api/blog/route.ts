import { NextResponse } from "next/server";
import { getLatestPosts } from "@/lib/blog";

export const revalidate = 3600; // revalidate cached response every hour

export async function GET() {
  const posts = await getLatestPosts(3);
  return NextResponse.json(posts);
}
