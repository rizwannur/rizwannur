import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { aboutData } from "@/data/AboutSection";
import "../animations/animate.css";

interface AboutSectionProps {
  className?: string;
}

const AboutSection = ({ className = "" }: AboutSectionProps) => {
  return (
    <section
      className={`relative z-10 w-full bg-[#0E1016] bg-cover bg-center pt-16 pb-36 md:pt-20 md:pb-44 lg:pt-20 lg:pb-56 ${className}`}
      id="about"
    >
      <ScrollReveal direction="left">
        <div className="w-[90%] mx-auto max-w-[1440px]">
          <h2 className="mb-10 text-left text-[40px] font-bold leading-[0.95em] tracking-tighter text-[#e4ded7] sm:text-[45px] md:mb-16 md:text-[60px] lg:text-[72px]">
            {aboutData.mainTitle}
          </h2>
        </div>
      </ScrollReveal>

      <div className="w-[90%] mx-auto max-w-[1440px]">
        <div className="flex w-full flex-col lg:flex-row lg:gap-20">
          <ScrollReveal direction="left" delay={0.1} className="mb-10 flex w-full flex-col gap-4 text-lg font-medium leading-relaxed tracking-wide text-[#e4ded7] md:mb-16 md:gap-6 md:text-xl md:leading-relaxed lg:mb-16 lg:max-w-[70%] lg:text-2xl">
            {aboutData.description.map((paragraph, index) => (
              <AnimatedBody key={index} text={paragraph} />
            ))}
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2} className="mb-24 flex w-full flex-col gap-4 text-lg font-normal leading-relaxed tracking-wide text-[#e4ded7]/80 sm:mb-32 md:mb-40 md:gap-6 md:text-base md:leading-normal lg:mt-0 lg:mb-16 lg:max-w-[30%] lg:text-lg">
            <div className="flex flex-col gap-4 md:gap-3">
              <AnimatedTitle
                text={aboutData.skills.frontendTools.title}
                className="text-2xl text-[#e4ded7] md:text-[30px] lg:text-xl"
                wordSpace="mr-[0.25em]"
                charSpace="mr-[0.01em]"
              />
              <AnimatedBody
                text={aboutData.skills.frontendTools.description}
              />
            </div>
            <div className="flex flex-col gap-3">
              <AnimatedTitle
                text={aboutData.skills.uiLibraries.title}
                className="text-2xl text-[#e4ded7] md:text-[30px] lg:text-xl"
                wordSpace="mr-[0.25em]"
                charSpace="mr-[0.01em]"
              />
              <AnimatedBody
                text={aboutData.skills.uiLibraries.description}
              />
            </div>
            <div className="flex flex-col gap-3">
              <AnimatedTitle
                text={aboutData.skills.designTools.title}
                className="text-2xl text-[#e4ded7] md:text-[30px] lg:text-xl"
                wordSpace="mr-[0.25em]"
                charSpace="mr-[0.01em]"
              />
              <AnimatedBody
                text={aboutData.skills.designTools.description}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
