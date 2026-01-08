import AnimatedWords2 from "@/components/animations/AnimatedWords2";
import { monaSans } from "@/app/fonts/monaSans";
import AnimatedBody from "@/components/animations/AnimatedBody";
import { blogTitle, blogDescription } from "@/data/BlogSection"; // Importing the data
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BlogSection = () => {
  return (
    <section className="z-10 flex w-full flex-col items-center justify-center overflow-hidden bg-[#0E1016] bg-cover bg-center pt-12 pb-14 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20">
      <div
        className="relative mb-12 flex w-[90%] max-w-[1200px] flex-col items-center justify-center gap-6 text-[#e4ded7]"
      >
        <AnimatedWords2
          title={blogTitle} // Using imported data
          style={`flex max-w-[900px] flex-col items-center text-center ${monaSans.className} font-extrabold uppercase leading-[0.9em] text-[#e4ded7] sm:max-w-full sm:flex-row sm:items-center sm:justify-center sm:text-center lg:text-center text-[clamp(56px,7.5vw,110px)]`}
        />
        <AnimatedBody
          text={blogDescription} // Using imported data
          className="max-w-[820px] text-center text-[14px] font-semibold uppercase text-[#e4ded7]/75 md:text-[16px]"
        />
      </div>
      {/* Blog cards are intentionally disabled for now. */}
      <div className="w-[90%] max-w-[1200px]">
        <div className="mx-auto flex max-w-[720px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 text-center text-[#e4ded7] backdrop-blur-sm md:p-8">
          <p className="text-base font-semibold text-[#e4ded7]/85">
            Read the full archive on my blog.
          </p>
          <Button
            asChild
            variant="outline"
            className="border-[#e4ded7]/25 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
          >
            <Link href="https://blog.rizwannur.com" target="_blank" aria-label="Open blog">
              Visit blog.rizwannur.com
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
