import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

// Type assertion for FontAwesome icons to fix compatibility issues
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
const githubIcon = faGithub as IconDefinition;
const linkIcon = faLink as IconDefinition;
import { ProjectCardProps } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import AnimatedTitle from "@/components/animations/AnimatedTitle";
import AnimatedBody from "@/components/animations/AnimatedBody";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { id, name, description, technologies, github, demo, image, available } = project;

  return (
    <motion.div
      className="relative z-10 h-[550px] w-full items-stretch justify-center overflow-hidden sm:h-[700px] sm:w-full md:h-[650px] md:w-full lg:h-[500px]"
      initial="initial"
      animate="animate"
    >
      <Card className="relative h-full w-full bg-[#212531] bg-cover bg-center bg-no-repeat border-none shadow-none rounded-3xl py-0">
        <Image
          src={image}
          alt={name}
          className={`absolute -bottom-2 w-[70%] sm:w-[85%] md:w-[60%] lg:max-w-[55%] ${
            id % 2 === 0 ? "right-0" : "left-0"
          }`}
        />
        
        <div
          className={`absolute top-0 text-[#0E1016] ${
            id % 2 === 0 ? "left-0 ml-8 lg:ml-14" : "right-0 mr-8 lg:mr-14"
          } mt-6 flex items-center justify-center gap-4 lg:mt-10`}
        >
          {available ? (
            <>
              <Link
                href={github}
                target="_blank"
                className="rounded-full"
                aria-label="Open GitHub Repository"
              >
                <FontAwesomeIcon
                  icon={githubIcon}
                  className="w-5 rounded-full bg-white p-5 text-xl md:w-6 md:text-2xl lg:w-8 lg:text-3xl"
                  data-blobity
                  data-blobity-radius="38"
                  data-blobity-offset-x="4"
                  data-blobity-offset-y="4"
                  data-blobity-magnetic="true"
                />
              </Link>
              <Link href={demo} target="_blank" aria-label="Open Live Demo">
                <FontAwesomeIcon
                  icon={linkIcon}
                  className="w-5 rounded-full bg-white p-5 text-xl md:w-6 md:text-2xl lg:w-8 lg:text-3xl"
                  data-blobity
                  data-blobity-radius="38"
                  data-blobity-offset-x="4"
                  data-blobity-offset-y="4"
                  data-blobity-magnetic="true"
                />
              </Link>
            </>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Link
                href={github}
                target="_blank"
                className="mt-1 rounded-full"
                aria-label="Open GitHub Repository"
              >
                <FontAwesomeIcon
                  icon={githubIcon}
                  className="w-5 rounded-full bg-white p-5 text-xl md:w-6 md:text-2xl lg:w-8 lg:text-3xl"
                  data-blobity
                  data-blobity-radius="38"
                  data-blobity-offset-x="4"
                  data-blobity-offset-y="4"
                  data-blobity-magnetic="true"
                />
              </Link>
              <div className="rounded-xl bg-white px-4 py-2 md:px-5 md:py-3 lg:px-6 lg:py-4">
                <h3 className="text-base md:text-lg lg:text-xl">
                  Coming soon
                </h3>
              </div>
            </div>
          )}
        </div>
        
        <div
          className={`absolute text-white ${
            !(id % 2 === 0)
              ? "right-0 top-32 mr-0 ml-10 md:right-0 md:ml-0 lg:right-0 lg:top-60 lg:mr-4"
              : "left-10 top-32 ml-0 md:mr-12 lg:top-52 lg:ml-4"
          } mb-10 md:mb-16 lg:mb-14`}
        >
          <AnimatedTitle
            text={name}
            className="max-w-[90%] text-4xl leading-none text-white md:text-5xl md:leading-none lg:max-w-[450px] lg:text-5xl lg:leading-none"
            wordSpace="mr-1"
            charSpace="-mr-[0.01em]"
          />
          <AnimatedBody
            text={description}
            className="mt-4 w-[90%] max-w-[457px] text-base font-semibold text-[#95979D]"
          />
          <div className="mt-9 flex gap-4">
            {technologies.map((tech, index) => (
              <AnimatedTitle
                text={tech}
                wordSpace="mr-1"
                charSpace="mr-[0.01em]"
                key={index}
                className="text-sm font-bold uppercase md:text-base lg:text-lg"
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
