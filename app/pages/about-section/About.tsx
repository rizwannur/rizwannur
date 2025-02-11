import SongCarousel from "./SongCarousel";
import "../../animations/animate.css";
import AnimatedBody from "../../animations/AnimatedBody";
import AnimatedTitle from "../../animations/AnimatedTitle";

const About = () => {
  return (
    <section
      className="relative z-10 w-full items-center justify-center overflow-hidden bg-[#0E1016] bg-cover bg-center pt-16 pb-36 md:pt-20 md:pb-44 lg:pt-20 lg:pb-56"
      id="about"
    >
      <div className="mx-auto flex w-[90%] flex-col items-center justify-center lg:max-w-[1212.8px]">
        <AnimatedTitle
          text={"Entrepreneurial Mindset & Tech Enthusiast"}
          className={
            "mb-10 text-left text-[40px] font-bold leading-[0.9em] tracking-tighter text-[#e4ded7] sm:text-[45px] md:mb-16 md:text-[60px] lg:text-[80px]"
          }
          wordSpace={"mr-[14px]"}
          charSpace={"mr-[0.001em]"}
        />

        <div className="mx-auto flex w-[100%] flex-col lg:max-w-[1200px] lg:flex-row lg:gap-20">
          <div className="mb-10 flex w-[100%] flex-col gap-4 text-[18px] font-medium leading-relaxed tracking-wide text-[#e4ded7] md:mb-16 md:gap-6 md:text-[20px] md:leading-relaxed lg:mb-16 lg:max-w-[90%] lg:text-[24px] ">
            <AnimatedBody
              text={
                "Business is my passion, and I'm always looking for ways to innovate and grow. My journey started with an interest in technology, and over time, I developed a deep appreciation for entrepreneurship."
              }
            />
            <AnimatedBody
              text={
                "I have experience in web development, particularly with the MERN stack, and enjoy experimenting with creative coding. While I don't primarily identify as a developer, I have the ability to work with code and bring ideas to life when needed. My expertise lies in business strategy, branding, and scaling ventures."
              }
              className={"hidden"}
            />
            <AnimatedBody
              text={
                "My goal is to achieve financial independence, retire my parents, and build impactful businesses. I navigate multiple industries, including fashion, tech, and marketing, while leveraging my skills in RMG merchandising to help brands place fresh orders at wholesale prices. My drive for success is fueled by a vision of growth and innovation."
              }
            />
            <AnimatedBody
              text={
                "Although my main focus is growing my brand and business, I also explore various side projects, keeping an open mind to new opportunities. I share my journey through my work, and as I scale up, I plan to document more insights and experiences for aspiring entrepreneurs."
              }
            />
          </div>

          <div className="mb-24 flex w-[100%] flex-col gap-4 text-[18px] font-normal leading-relaxed tracking-wide text-[#e4ded7]/80 sm:mb-32 md:mb-40 md:gap-6 md:text-[16px] md:leading-normal lg:mt-0 lg:mb-16 lg:max-w-[30%] lg:text-[18px]">
            <div className="flex flex-col gap-4 md:gap-3">
              <AnimatedTitle
                text={"Skills & Strengths"}
                className={
                  "text-[24px] text-[#e4ded7] md:text-[30px] lg:text-[20px]"
                }
                wordSpace={"mr-[0.25em]"}
                charSpace={"mr-[0.01em]"}
              />
              <AnimatedBody
                text={
                  "I understand business strategies, branding, and marketing. I can build and scale online stores, leverage social media for growth, and navigate RMG exports. I also have a foundation in web development and UI/UX, allowing me to bring ideas to life in digital form."
                }
              />
            </div>
            <div className="flex flex-col gap-3">
              <AnimatedTitle
                text={"Future Plans"}
                className={
                  "text-[24px] text-[#e4ded7] md:text-[30px] lg:text-[20px]"
                }
                wordSpace={"mr-[0.25em]"}
                charSpace={"mr-[0.01em]"}
              />
              <AnimatedBody
                text={
                  "My vision is to expand my brand, dominate the online fashion market, and explore new business opportunities. I also plan to study abroad to gain global exposure. While my main focus is business, I’m open to AI, robotics, and new tech innovations. My approach is always hands-on—I experiment, learn fast, and adapt to challenges."
                }
              />
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col md:-mt-0 lg:mt-28">
          <SongCarousel />
          <AnimatedBody
            text="Some songs I vibe with—give them a listen if you're into good music."
            className="absolute bottom-10 right-0 left-0 mx-auto w-[90%] text-center text-[14px] font-semibold uppercase text-[#e4ded7] sm:w-[500px] md:bottom-12 md:w-[550px] md:text-[16px] "
          />
        </div>
      </div>
    </section>
  );
};

export default About;
