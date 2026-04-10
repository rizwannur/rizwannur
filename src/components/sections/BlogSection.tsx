"use client";
import { useEffect, useState } from "react";
import AnimatedWords2 from "@/components/animations/AnimatedWords2";
import { monaSans } from "@/app/fonts/monaSans";
import ScrollReveal from "@/components/animations/ScrollReveal";
import BlogCard from "@/components/cards/BlogCard";
import { blogTitle, blogDescription } from "@/data/BlogSection";
import type { BlogPost } from "@/lib/blog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        setPosts(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section className="z-10 flex w-full flex-col items-center justify-center bg-[#0E1016] bg-cover bg-center pt-12 pb-14 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20">
      <ScrollReveal direction="left">
        <div className="w-[90%] mx-auto max-w-[1440px] mb-12 flex flex-col items-center justify-center gap-6 text-[#e4ded7]">
          <AnimatedWords2
            title={blogTitle}
            style={`flex max-w-[900px] flex-col items-center text-center ${monaSans.className} font-extrabold uppercase leading-[0.9em] text-[#e4ded7] sm:max-w-full sm:flex-row sm:items-center sm:justify-center sm:text-center lg:text-center text-[clamp(56px,7.5vw,110px)]`}
          />
          <p className="max-w-[820px] text-center text-[14px] font-semibold uppercase text-[#e4ded7]/75 md:text-[16px]">
            {blogDescription}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="left" delay={0.15}>
        <div className="w-[90%] mx-auto max-w-[1440px]">
          {/* Skeleton while loading */}
          {!loaded && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[380px] rounded-2xl border border-[#212531] bg-[#0b0d13]/60 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Posts grid */}
          {loaded && posts.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#e4ded7]/25 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                >
                  <Link href="https://blog.rizwannur.com" target="_blank" aria-label="Read all posts">
                    Read all posts →
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* Fallback if fetch failed or no posts */}
          {loaded && posts.length === 0 && (
            <div className="mx-auto flex max-w-[720px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 text-center text-[#e4ded7] backdrop-blur-sm md:p-8">
              <p className="text-base font-semibold text-[#e4ded7]/85">
                Read the full archive on my blog.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-[#e4ded7]/25 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
              >
                <Link href="https://blog.rizwannur.com" target="_blank" aria-label="Open blog">
                  Visit blog.rizwannur.com
                </Link>
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
};

export default BlogSection;
