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
          text={
            "Enthusiastic about Technology"
          }
          className={
            "mb-10 text-left text-[40px] font-bold leading-[0.9em] tracking-tighter text-[#e4ded7] sm:text-[45px] md:mb-16 md:text-[60px] lg:text-[80px]"
          }
          wordSpace={"mr-[14px]"}
          charSpace={"mr-[0.001em]"}
        />

        <div className="mx-auto flex w-[100%] flex-col lg:max-w-[1200px] lg:flex-row lg:gap-20">
          <div className="mb-10 flex w-[100%] flex-col gap-4 text-[18px] font-medium  leading-relaxed tracking-wide text-[#e4ded7] md:mb-16 md:gap-6 md:text-[20px] md:leading-relaxed lg:mb-16  lg:max-w-[90%] lg:text-[24px] ">
            <AnimatedBody
              text={
                "I'm currently an 11th grader from Bangladesh, pursuing my higher secondary education. I'm preparing for my board exams and I want to learn new things and build my own startup."
              }
            />
            <AnimatedBody
              text={
                "Due to my interest in technology, I started learning web development and programming. I began with JavaScript out of enthusiasm and continued building Discord bots, eventually finding that I enjoyed creating them more than anything else. Later, I decided to start learning other programming languages and technologies."
              }
              className={"hidden"}
            />
            <AnimatedBody
              text={
                "I always knew I had to do something significant in my life, but I was unsure where to start. I had a vision of building my own startup and becoming my own boss. I might pursue a career in AI or something related to technology. That's precisely what I plan to do after my board exams. I'll also try to apply for internships to gain more experience and learn new things."
              }
            />
            <AnimatedBody
              text={
                "I haven't started working on my startup yet, but I will soon. I'll keep posting updates on my website as I progress in my journey. Alongside that, I'll be writing blogs about my experiences and journey. Due to academic commitments, I'll be doing all of this during my weekends and vacations. At this point, it's more of a passion for me, and I want to see where it leads."
              }
            />
            
          </div>

          <div className="mb-24 flex w-[100%] flex-col gap-4 text-[18px] font-normal leading-relaxed tracking-wide text-[#e4ded7]/80 sm:mb-32 md:mb-40 md:gap-6 md:text-[16px] md:leading-normal lg:mt-0 lg:mb-16 lg:max-w-[30%] lg:text-[18px]">
            <div className="flex flex-col gap-4 md:gap-3">
              <AnimatedTitle
                text={"What can i do"}
                className={
                  "text-[24px] text-[#e4ded7] md:text-[30px] lg:text-[20px]"
                }
                wordSpace={"mr-[0.25em]"}
                charSpace={"mr-[0.01em]"}
              />
              <AnimatedBody
                text={
                  "Learning Js, CSS, HTML. I can understand how a program works, comprehend its logic and flow. I can build full-stack applications using the MERN stack and create simple Discord bots using the Discord.js library. I can read documentation and learn how to use APIs of different libraries and frameworks. While I don't consider myself a UI/UX designer, I can create simple designs using AI and various tools. Then, I can craft them into a working and responsive website."
                }
              />
            </div>
            <div className="flex flex-col gap-3">
              <AnimatedTitle
                text={"What i plan to do"}
                className={
                  "text-[24px] text-[#e4ded7] md:text-[30px] lg:text-[20px]"
                }
                wordSpace={"mr-[0.25em]"}
                charSpace={"mr-[0.01em]"}
              />
              <AnimatedBody
                text={
                  "After my 12th Board exams, I want to explore universities abroad and apply to them. I currently don't have any preferences, but I'll try to find scholarships to assist with my education. In addition to my current skills, I plan to engage in extracurricular activities to further develop my abilities. I intend to learn more about AI and delve into robotics. Although I haven't found suitable opportunities yet, I'll continue searching and eventually start working on these areas. As a self-learner, I excel at my own pace but struggle with strict deadlines. While I prefer working independently, my ability to collaborate depends on the team dynamics. I'm more introverted and value privacy in professional settings."
                }
              />
            </div>
           
          </div>
        </div>
        <div className="mt-10 flex flex-col md:-mt-0 lg:mt-28">
          <SongCarousel />
          <AnimatedBody
            text="A few songs I can recommend if you're looking for some fresh tunes :)"
            className="absolute bottom-10 right-0 left-0 mx-auto w-[90%] text-center text-[14px] font-semibold uppercase text-[#e4ded7] sm:w-[500px] md:bottom-12 md:w-[550px] md:text-[16px] "
          />
        </div>
      </div>
    </section>
  );
};

export default About;