import { useState, useEffect } from 'react';
import { Song } from "@/lib/types";
import SongCard from "../cards/SongCard";
import AnimatedBody from "../animations/AnimatedBody";
import AnimatedTitle from "../animations/AnimatedTitle";
import { aboutData } from "@/data/AboutSection";
import { UI_ERROR, UI_LOADING, UI_NO_SONGS } from "@/data/Globals";
import LogoLoop from "@/components/LogoLoop";
import { techStacksData } from "@/data/TechStacks";
import "../animations/animate.css";

interface AboutSectionProps {
  className?: string;
}

const AboutSection = ({ className = "" }: AboutSectionProps) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const techLogos = techStacksData.stacks.map((stack) => ({
    node: (
      <span className="rounded-full border border-[#212531] bg-[#212531]/40 px-4 py-2 text-sm font-semibold text-[#e4ded7] backdrop-blur-sm">
        {stack.name}
      </span>
    ),
    href: stack.href,
    title: stack.name,
    ariaLabel: `Open ${stack.name}`,
  }));

  useEffect(() => {
    const getSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/youtube');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch songs from API');
        }
        
        const fetchedSongs = await response.json();
        setSongs(fetchedSongs);
      } catch (err) {
        setError(UI_ERROR);
        console.error("Error fetching songs:", err);
      } finally {
        setLoading(false);
      }
    };

    getSongs();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <section
      className={`relative z-10 w-full items-center justify-center overflow-hidden bg-[#0E1016] bg-cover bg-center pt-16 pb-36 md:pt-20 md:pb-44 lg:pt-20 lg:pb-56 ${className}`}
      id="about"
    >
      <div className="mx-auto flex w-[90%] flex-col items-center justify-center lg:max-w-[1212.8px]">
        <AnimatedTitle
          text={aboutData.mainTitle}
          className="mb-10 text-left text-[40px] font-bold leading-[0.9em] tracking-tighter text-[#e4ded7] sm:text-[45px] md:mb-16 md:text-[60px] lg:text-[80px]"
          wordSpace="mr-[14px]"
          charSpace="mr-[0.001em]"
        />

        <div className="mx-auto flex w-full flex-col lg:max-w-[1200px] lg:flex-row lg:gap-20">
          <div className="mb-10 flex w-full flex-col gap-4 text-lg font-medium leading-relaxed tracking-wide text-[#e4ded7] md:mb-16 md:gap-6 md:text-xl md:leading-relaxed lg:mb-16 lg:max-w-[90%] lg:text-2xl">
            {aboutData.description.map((paragraph, index) => (
              <AnimatedBody key={index} text={paragraph} />
            ))}
          </div>

          <div className="mb-24 flex w-full flex-col gap-4 text-lg font-normal leading-relaxed tracking-wide text-[#e4ded7]/80 sm:mb-32 md:mb-40 md:gap-6 md:text-base md:leading-normal lg:mt-0 lg:mb-16 lg:max-w-[30%] lg:text-lg">
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
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center md:-mt-0 lg:mt-28">
          <div id="stacks" className="mb-10 w-[90%] max-w-[1200px]">
            <AnimatedTitle
              text={techStacksData.title}
              className="mb-4 text-left text-2xl text-[#e4ded7] md:text-[30px] lg:text-xl"
              wordSpace="mr-[0.25em]"
              charSpace="mr-[0.01em]"
            />
            <LogoLoop
              logos={techLogos}
              speed={95}
              direction="left"
              gap={18}
              logoHeight={18}
              fadeOut
              fadeOutColor="#0E1016"
              scaleOnHover
              pauseOnHover
              ariaLabel="Tech stack logos"
            />
          </div>

          <AnimatedBody
            text={aboutData.musicSectionText}
            className="mb-8 w-[90%] overflow-x-auto whitespace-nowrap text-center text-sm font-semibold uppercase text-[#e4ded7] sm:w-[500px] md:mb-12 md:w-[550px] md:text-base"
          />
          {loading && (
            <p className="text-[#e4ded7]">{UI_LOADING}</p>
          )}
          {error && (
            <p className="text-red-500">{error}</p>
          )}
          {!loading && !error && songs.length === 0 && (
            <p className="text-[#e4ded7]">{UI_NO_SONGS}</p>
          )}
          {!loading && !error && songs.length > 0 && (
            <div className="relative w-full overflow-hidden">
              <div className="animate flex gap-4 whitespace-nowrap">
                {/* First set of songs */}
                <div className="flex gap-4 shrink-0">
                  {songs.map((song: Song, index) => (
                    <SongCard
                      key={index}
                      song={song}
                    />
                  ))}
                </div>
                {/* Duplicate set for seamless loop */}
                <div className="flex gap-4 shrink-0">
                  {songs.map((song: Song, index) => (
                    <SongCard
                      key={`duplicate-${index}`}
                      song={song}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;