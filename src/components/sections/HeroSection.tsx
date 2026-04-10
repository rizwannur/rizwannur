import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { monaSans } from "@/app/fonts/monaSans";
import { imageAnimation, bodyAnimation } from "../animations/animations";
import AnimatedWords from "../animations/AnimatedWords";
import { heroData } from "@/data/HeroSection"; // Importing the data
import { UI_BOOK_CALL_BUTTON } from "@/data/Globals";

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = "" }: HeroSectionProps) => {
  const renderLinkedTech = (text: string) => {
    const parts = text.split(/(Next\.js|Tauri)/g);

    return parts.map((part, i) => {
      if (part === "Next.js") {
        return (
          <Link
            key={`next-${i}`}
            href="https://nextjs.org"
            target="_blank"
            className="underline underline-offset-4 decoration-[#e4ded7]/60 hover:decoration-[#e4ded7]"
            aria-label="Next.js"
          >
            Next.js
          </Link>
        );
      }

      if (part === "Tauri") {
        return (
          <Link
            key={`tauri-${i}`}
            href="https://tauri.app"
            target="_blank"
            className="underline underline-offset-4 decoration-[#e4ded7]/60 hover:decoration-[#e4ded7]"
            aria-label="Tauri"
          >
            Tauri
          </Link>
        );
      }

      return <span key={`t-${i}`}>{part}</span>;
    });
  };

  return (
    <motion.section
      className={`relative z-10 flex h-[80vh] w-full items-stretch justify-center bg-cover bg-center py-0 sm:h-[82vh] md:h-[85vh] lg:h-[88vh] 3xl:h-[80vh] ${className}`}
      id="home"
      initial="initial"
      animate="animate"
      style={{
        backgroundImage: `url('${heroData.backgroundImage ?? "/hero.jpg"}')`,
      }}
    >
      <motion.div className="absolute inset-0 h-full w-full bg-[#0E1016]/35" />

      <div className="absolute top-10 flex justify-between sm:w-[90%] lg:max-w-[1440px]">
        <div>
          <Link
            href={heroData.callUrl} // Using data from heroData
            target="_blank"
            aria-label={UI_BOOK_CALL_BUTTON}
          >
            <motion.button
              className="hidden rounded-md border-2 border-[#e4ded7] py-2 px-4 text-sm font-semibold text-[#e4ded7] sm:block md:text-base lg:block"
              variants={bodyAnimation}
            >
              {UI_BOOK_CALL_BUTTON}
            </motion.button>
          </Link>
        </div>

        <div className="flex gap-10 text-[#e4ded7] sm:gap-12 md:gap-14 lg:gap-14">
          {heroData.socials.map((social, index) => ( // Using data from heroData
            <Link
              key={index}
              href={social.url}
              target="_blank"
              aria-label={`View ${social.name} Profile`}
            >
              <motion.p
                className="text-base font-bold text-[#e4ded7]"
                variants={bodyAnimation}
              >
                {social.shortName}
              </motion.p>
            </Link>
          ))}
        </div>
      </div>

      <div className="-mt-36 flex flex-col items-center justify-center sm:-mt-20 lg:my-40 lg:-mt-2 lg:py-40">
        <div
          className={`relative flex flex-col items-center justify-center ${monaSans.className}`}
        >
          <AnimatedWords
            title={heroData.name} // Using data from heroData
            style="inline-block overflow-hidden pt-1 -mr-4 sm:-mr-5 md:-mr-7 lg:-mr-9 -mb-1 sm:-mb-2 md:-mb-3 lg:-mb-4"
          />
          <motion.div
            className="absolute bottom-[-110px] mx-auto sm:bottom-[-100px] md:bottom-[-130px] lg:bottom-[-150px]"
            variants={imageAnimation}
          >
            <Image
              src={heroData.profileImage} // Using data from heroData
              width={245}
              height={245}
              priority
              alt="Hero profile photo"
              data-blobity-tooltip="Fine Boy"
              data-blobity-invert="false"
              className="w-[150px] rounded-2xl md:w-[200px] md:rounded-[32px] lg:w-[245px]"
            />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 flex w-full items-center justify-center md:bottom-10 lg:w-[90%] lg:max-w-[1440px] lg:justify-between">
        {/* Mobile/tablet: single block */}
        <motion.div
          className="max-w-[350px] md:max-w-[520px] lg:hidden"
          variants={bodyAnimation}
        >
          <p className="z-50 text-center text-base font-medium text-[#e4ded7] md:text-xl">
            {heroData.tagline[0]}{" "}
            {heroData.koraUrl &&
            !/(Next\.js|Tauri)/.test(heroData.tagline[1]) ? (
              <Link
                href={heroData.koraUrl}
                target="_blank"
                className="underline underline-offset-4 decoration-[#e4ded7]/60 hover:decoration-[#e4ded7]"
                aria-label="External link"
              >
                {heroData.tagline[1]}
              </Link>
            ) : (
              renderLinkedTech(heroData.tagline[1])
            )}{" "}
            {heroData.tagline[2]}
          </p>
        </motion.div>

        {/* Desktop: split left/right equally */}
        <motion.div className="hidden lg:block lg:max-w-[520px]" variants={bodyAnimation}>
          <p className="z-50 text-left text-xl font-medium text-[#e4ded7]">
            {heroData.tagline[0]}{" "}
            {heroData.koraUrl && !/(Next\.js|Tauri)/.test(heroData.tagline[1]) ? (
              <Link
                href={heroData.koraUrl}
                target="_blank"
                className="underline underline-offset-4 decoration-[#e4ded7]/60 hover:decoration-[#e4ded7]"
                aria-label="External link"
              >
                {heroData.tagline[1]}
              </Link>
            ) : (
              renderLinkedTech(heroData.tagline[1])
            )}
          </p>
        </motion.div>
        <motion.div className="hidden lg:block lg:max-w-[520px]" variants={bodyAnimation}>
          <p className="z-50 text-right text-xl font-medium text-[#e4ded7]">
            {heroData.tagline[2]}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;