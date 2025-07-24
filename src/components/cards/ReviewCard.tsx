import { ReviewCardProps } from "@/lib/types";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import slash from "../../../public/review-slash.svg";

const ReviewCard = ({ review }: ReviewCardProps) => {
  const { name, role, company, profileImg, testimonial, index = 0 } = review;

  const abbreviateName = (name: string): string => {
    const [firstName, lastName] = name.split(" ");
    return `${firstName} ${lastName[0]}.`;
  };

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
      className="relative flex h-[473px] w-full flex-col items-start justify-between sm:h-[450px] sm:items-center sm:justify-start lg:h-[393px] lg:max-w-[438px]"
    >
      <Card className="relative flex h-full w-full flex-col items-start justify-between border-[3px] border-[#212531] bg-transparent p-7 shadow-none rounded-[23px]">
        <Image
          src={slash}
          alt="Quote mark"
          className="absolute top-[34px] left-7 w-[51px]"
        />

        <p className="mt-10 text-lg font-medium leading-relaxed tracking-wide text-[#e4ded7]">
          {testimonial}
        </p>

        <div className="flex gap-3 sm:absolute sm:bottom-7 sm:left-7">
          <Image
            src={profileImg}
            alt={`${name} profile`}
            width={1600}
            height={840}
            className="h-[41px] w-[41px] rounded-full bg-contain bg-center object-cover grayscale"
          />
          <div className="flex flex-col gap-1 pr-7">
            <h3 className="w-44 text-2xl font-bold uppercase leading-[20.7px] tracking-[-0.46056px] text-[#e4ded7]">
              {abbreviateName(name)}
            </h3>
            <p className="text-sm font-medium leading-4 text-[#95979D]">
              {role} @ {company}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReviewCard;