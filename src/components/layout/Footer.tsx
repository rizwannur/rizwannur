"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedBody from "@/components/animations/AnimatedBody";
import { FooterProps } from "@/lib/types";
import { FOOTER_DESIGN_TEXT, FOOTER_DEVELOPER_URL, FOOTER_ARIA_LABEL, FOOTER_DEVELOPER_NAME } from "@/data/Globals"; // Import from Globals.ts

const Footer: React.FC<FooterProps> = () => {
  const year = new Date().getFullYear();

  return (
    <motion.section
      className="h-[15vh] w-full items-center justify-center border-t-[3px] border-[#e4ded7]/30 bg-[#0E1016] pt-10 font-bold uppercase md:h-[20vh] md:py-16 lg:h-[10vh] lg:pt-6 lg:pb-0"
      initial="initial"
      animate="animate"
    >
      <motion.div className="mx-auto flex w-[90%] flex-row items-center justify-between text-center text-xs text-[#e4ded7] sm:text-xs md:text-sm lg:max-w-[1440px] lg:text-sm">
        <AnimatedBody text={`Copyright ${year}`} className="m-0 p-0" />
        <div className="flex flex-col gap-1 sm:flex-row md:gap-2">
          <AnimatedBody
            text={FOOTER_DESIGN_TEXT} // Using constant
            className="m-0 p-0"
          />
          <Link
            href={FOOTER_DEVELOPER_URL} // Using constant
            target="_blank"
            aria-label={FOOTER_ARIA_LABEL} // Using constant
            className="underline underline-offset-2 hover:no-underline"
          >
            <AnimatedBody text={FOOTER_DEVELOPER_NAME} className="m-0 p-0" /> {/* Using constant */}
          </Link>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Footer;
