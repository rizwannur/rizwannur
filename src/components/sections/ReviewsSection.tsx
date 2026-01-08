import { reviews, reviewsTitle, reviewsDescription } from "@/data/ReviewSection";
import ReviewCard from "../cards/ReviewCard";
import { motion } from "framer-motion";
import Image from "next/image";
import hireMe from "./../../../public/assets/hiremeoncontra-dark.webp";

interface ReviewsSectionProps {
  className?: string;
}

const ReviewsSection = ({ className = "" }: ReviewsSectionProps) => {
  const rowA = reviews.filter((_, i) => i % 2 === 0);
  const rowB = reviews.filter((_, i) => i % 2 === 1);

  const shuffle = <T,>(input: T[]) => {
    // deterministic shuffle to keep render stable
    let seed = 1337;
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const padTo = <T,>(input: T[], minItems: number) => {
    if (input.length === 0) return [];
    const out = [...input];
    while (out.length < minItems) out.push(...input);
    return out.slice(0, minItems);
  };

  const baseA = padTo(shuffle(rowA), 10);
  const baseB = padTo(shuffle(rowB), 10);

  return (
    <section
      id="testimonials"
      className={`relative z-10 flex w-full flex-col items-center justify-center overflow-hidden bg-[#0E1016] bg-cover bg-center pt-20 pb-16 lg:pb-24 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light">
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_30%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(900px_500px_at_80%_70%,rgba(167,139,250,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,16,22,0.2),rgba(14,16,22,0.85))]" />
      </div>

      <div className="mb-12 w-[90%] max-w-[1250px] text-[#e4ded7]">
        <h2 className="text-5xl font-bold tracking-tight md:text-6xl">
          {reviewsTitle}
        </h2>
        <p className="mt-4 max-w-[720px] text-sm font-medium text-[#e4ded7]/70 md:text-base">
          {reviewsDescription}
        </p>
      </div>
      
      <motion.div className="relative w-[90%] max-w-[1250px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0E1016] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0E1016] to-transparent" />

        <div className="flex flex-col gap-6">
          <div className="marquee [--marquee-duration:26s] [--marquee-delay:-8s]">
            <div className="marquee-track gap-6">
              {[...baseA, ...baseA].map((review, index) => (
                <div key={`a-${index}`} className="w-[320px] shrink-0">
                  <ReviewCard review={{ ...review, index }} />
                </div>
              ))}
            </div>
          </div>

          <div className="marquee marquee-reverse [--marquee-duration:31s] [--marquee-delay:-13s]">
            <div className="marquee-track gap-6">
              {[...baseB, ...baseB].map((review, index) => (
                <div key={`b-${index}`} className="w-[320px] shrink-0">
                  <ReviewCard review={{ ...review, index }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contra badge hidden for now */}
    </section>
  );
};

export default ReviewsSection;
