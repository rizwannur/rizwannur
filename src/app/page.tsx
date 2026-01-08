"use client";
import { useEffect } from "react";
import useBlobity from "blobity/lib/react/useBlobity";
import dynamic from "next/dynamic";

// Import components from new structure
import { HeroSection } from "@/components/sections";
import { PreLoader } from "@/components/animations";
import { initialBlobityOptions } from "@/lib/blobity-config";

// Dynamic imports for performance optimization
import { ReviewsSection } from "@/components/sections";
const WorkSection = dynamic(() =>
  import("@/components/sections").then((mod) => ({ default: mod.WorkSection }))
);
const AboutSection = dynamic(() =>
  import("@/components/sections").then((mod) => ({ default: mod.AboutSection }))
);
const ContactSection = dynamic(() =>
  import("@/components/sections").then((mod) => ({
    default: mod.ContactSection,
  }))
);
const Footer = dynamic(() =>
  import("@/components/layout").then((mod) => ({ default: mod.Footer }))
);

const BlogSection = dynamic(() =>
  import("@/components/sections").then((mod) => ({
    default: mod.BlogSection,
  }))
);

export default function Home() {
  const blobityInstance = useBlobity(initialBlobityOptions);

  useEffect(() => {
    if (blobityInstance.current) {
      // @ts-expect-error for debugging purposes or playing around
      window.blobity = blobityInstance.current;
    }
  }, [blobityInstance]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return (
    <>
      <PreLoader />

      <main className="flex flex-col items-center justify-center">
        <HeroSection />
        <WorkSection />
        <ReviewsSection />
        <AboutSection />
        <BlogSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
