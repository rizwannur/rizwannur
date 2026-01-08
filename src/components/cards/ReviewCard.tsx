import { ReviewCardProps } from "@/lib/types";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import slash from "../../../public/assets/review-slash.svg";
import { Star } from "lucide-react";

const ReviewCard = ({ review }: ReviewCardProps) => {
  const { name, role, company, profileImg, testimonial, index = 0 } = review;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.7,
          delay: 0.1 * index,
          ease: [0.44, 0, 0.22, 0.99],
        },
      }}
      viewport={{
        amount: "some",
        once: true,
      }}
      className="relative w-full"
    >
      <Card className="relative flex h-[320px] w-full flex-col overflow-hidden rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 shadow-none backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={profileImg}
              alt={`${name} profile`}
              width={1600}
              height={840}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#e4ded7]">
                {name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#e4ded7]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-[#e4ded7] text-[#e4ded7]"
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Image
            src={slash}
            alt="Quote mark"
            width={22}
            height={22}
            className="opacity-80"
          />
        </div>

        <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-[#e4ded7]/80 line-clamp-6">
          {testimonial}
        </p>

        <p className="mt-4 text-right text-xs font-semibold text-[#e4ded7]/70">
          {role} @ {company}
        </p>
      </Card>
    </motion.div>
  );
};

export default ReviewCard;