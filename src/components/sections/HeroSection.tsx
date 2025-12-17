import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { monaSans } from "@/app/fonts/monaSans";
import { imageAnimation, bodyAnimation } from "../animations/animations";
import AnimatedWords from "../animations/AnimatedWords";
import { heroData } from "@/data/HeroSection"; // Importing the data

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className = "" }: HeroSectionProps) => {
  return (
    <motion.section
      className={`relative z-10 flex h-[85vh] w-full items-stretch justify-center bg-[url('/hero.jpg')] bg-cover bg-center py-0 sm:h-[90vh] md:h-[100vh] 3xl:h-[85vh] ${className}`}
      id="home"
      initial="initial"
      animate="animate"
    >
      <motion.div className="absolute left-0 top-0 right-0 bottom-0 h-full w-full bg-[#0E1016] mix-blend-color"></motion.div>

      <div className="absolute top-10 flex justify-between sm:w-[90%] lg:max-w-[1440px]">
        <div>
          <Link
            href={heroData.callUrl} // Using data from heroData
            target="_blank"
            aria-label="BOOK A CALL"
          >
            <motion.button
              className="hidden rounded-md border-2 border-[#e4ded7] py-2 px-4 text-sm font-semibold text-[#e4ded7] sm:block md:text-base lg:block"
              variants={bodyAnimation}
            >
              BOOK A CALL
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
              className="w-[150px] rounded-2xl grayscale hover:grayscale-0 md:w-[200px] md:rounded-[32px] lg:w-[245px]"
            />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 flex items-center justify-center md:bottom-10 lg:w-[90%] lg:max-w-[1440px] lg:justify-between">
        <motion.div
          className="max-w-[350px] md:max-w-[400px] lg:max-w-[400px]"
          variants={bodyAnimation}
        >
          <p className="z-50 text-center text-base font-medium text-[#e4ded7] md:text-xl lg:text-left">
            {heroData.tagline[0]}{" "} {/* Using data from heroData */}
            <Link
              href={heroData.koraUrl} // Using data from heroData
              target="_blank"
              className="underline underline-offset-2 hover:no-underline"
              aria-label="Kora Website"
            >
              {heroData.tagline[1]} {/* Using data from heroData */}
            </Link>{" "}
            {heroData.tagline[2]} {/* Using data from heroData */}
          </p>
        </motion.div>

        <motion.div
          className="hidden max-w-[500px] lg:block lg:max-w-[420px]"
          variants={bodyAnimation}
        >
          <p className="text-right text-base font-semibold text-[#e4ded7] md:text-xl">
            {heroData.location} {/* Using data from heroData */}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;