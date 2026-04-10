"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/lib/blog";
import { formatPostDate, postUrl } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

const BlogCard = ({ post, index }: BlogCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group flex flex-col rounded-2xl border border-[#212531] bg-[#0b0d13]/60 backdrop-blur-sm transition-colors hover:bg-[#0b0d13]/80"
    >
      <Link
        href={postUrl(post.slug)}
        target="_blank"
        aria-label={`Read: ${post.title}`}
        className="flex flex-col h-full"
      >
        {/* Cover image */}
        {post.featuredImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13]/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* Category + reading time */}
          <div className="flex items-center justify-between gap-2">
            {post.categories.length > 0 && (
              <Badge
                variant="secondary"
                className="border border-[#212531] bg-[#212531]/60 text-[#e4ded7]/70 text-xs uppercase tracking-wide"
              >
                {post.categories[0].name}
              </Badge>
            )}
            {post.readingTime > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-[#e4ded7]/50 ml-auto">
                <Clock className="h-3 w-3" />
                {post.readingTime} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold leading-snug tracking-tight text-[#e4ded7] line-clamp-2 group-hover:text-white transition-colors md:text-lg">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm font-medium leading-relaxed text-[#e4ded7]/60 line-clamp-2 flex-1">
              {post.excerpt}
            </p>
          )}

          {/* Footer: date + arrow */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#212531]">
            <span className="text-xs font-semibold text-[#e4ded7]/50">
              {formatPostDate(post.publishedDate)}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#212531]/60 text-[#e4ded7]/60 transition-all group-hover:bg-[#e4ded7]/10 group-hover:text-[#e4ded7]">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
