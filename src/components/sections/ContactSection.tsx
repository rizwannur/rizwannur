import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { monaSans } from "@/app/fonts/monaSans";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import AnimatedWords2 from "../animations/AnimatedWords2";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/button";
import heartIcon from "./../../../public/assets/heart icon.png";
import { contactData } from "@/data/ContactSection";

interface ContactSectionProps {
  className?: string;
}

const ContactSection = ({ className = "" }: ContactSectionProps) => {
  return (
    <motion.section
      className={`relative z-10 flex w-full items-center justify-center bg-[#0E1016] bg-cover bg-center py-24 md:py-32 lg:py-40 3xl:py-48 ${className}`}
      id="contact"
      initial="initial"
      animate="animate"
    >
      <div className="w-[90%] mx-auto max-w-[1440px] flex flex-col items-center justify-center">
        {/* Giant headline */}
        <ScrollReveal direction="left">
          <div
            className={`flex flex-col items-start justify-center ${monaSans.className} relative w-full sm:items-center`}
          >
            <div className="relative z-10 w-full">
              <AnimatedWords2
                title={contactData.title}
                style="flex max-w-[500px] flex-col items-start text-left text-[150px] font-extrabold uppercase leading-[0.9em] text-[#e4ded7] sm:max-w-full sm:flex-row sm:items-center sm:justify-center sm:text-center sm:text-[170px] md:text-[200px] lg:text-center lg:text-[270px] xl:text-[390px]"
              />
            </div>
            <Image
              src={heartIcon}
              alt=""
              className="heartbeat pointer-events-none absolute -bottom-5 left-64 z-20 w-[120px] select-none sm:-bottom-14 sm:left-[40%] md:-bottom-18 md:left-[40%] md:w-[150px] lg:-bottom-16 lg:left-[42%] lg:w-[230px]"
              aria-hidden
            />
          </div>
        </ScrollReveal>

        {/* Description + CTAs + socials */}
        <ScrollReveal direction="left" delay={0.15}>
          <div className="mt-20 flex w-full flex-col gap-10 sm:mt-28 md:mt-36 md:flex-row md:items-start md:justify-between lg:mt-16">
            {/* Left: description + buttons */}
            <div className="flex w-full flex-col gap-5 md:max-w-[480px]">
              <AnimatedBody
                text={contactData.description}
                className="text-sm font-semibold uppercase leading-relaxed text-[#e4ded7]/80 md:text-base"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#e4ded7]/30 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                >
                  <Link
                    href={`mailto:${contactData.email}?subject=Project%20brief&body=Hi%20Rizwan%2C%20I%20need%20help%20with%20%5Bsystem%20or%20product%5D.%20Current%20stage%3A%20%5Bidea%2C%20build%2C%20or%20live%5D.%20What%20we%20need%3A%20%5Barchitecture%2C%20build%2C%20cleanup%2C%20or%20team%20support%5D.`}
                    target="_blank"
                    aria-label="Send a project brief"
                    data-blobity-magnetic="false"
                  >
                    Send the brief
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-[#22d3ee]/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                >
                  <Link
                    href={contactData.calendly}
                    target="_blank"
                    aria-label="Book a strategy call"
                    data-blobity-magnetic="false"
                  >
                    Book a strategy call
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: social links */}
            <div className="flex shrink-0 flex-wrap items-center gap-x-8 gap-y-3 text-base font-bold text-[#e4ded7] sm:gap-x-10 md:justify-end md:gap-x-8 lg:gap-x-14 lg:text-[28px]">
              {contactData.socials.map((social, index) => (
                <Link
                  key={index}
                  href={social.url}
                  target="_blank"
                  aria-label={`View ${social.name} Profile`}
                  data-blobity-magnetic="false"
                >
                  <AnimatedTitle
                    text={social.shortName}
                    className="text-base font-bold text-[#e4ded7] sm:text-xl md:text-base lg:text-[28px]"
                    wordSpace="mr-[0.25em]"
                    charSpace="mr-[0.01em]"
                  />
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </motion.section>
  );
};

export default ContactSection;
