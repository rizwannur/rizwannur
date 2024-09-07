"use client";
import Hero from "./pages/hero-section/Hero";
import useBlobity from "blobity/lib/react/useBlobity";
import { useEffect } from "react";
import { ScrollerMotion } from "scroller-motion";
import PreLoader from "./animations/PreLoader/PreLoader";
import { initialBlobityOptions } from "./utils/BlobityConfig";
import NavBar from "./components/NavBar";

import dynamic from "next/dynamic";
//import Reviews from "./pages/reviews-section/ReviewGrid";
const Work = dynamic(() => import("./pages/work-section/Work"));
const About = dynamic(() => import("./pages/about-section/About"));
const Blog = dynamic(() => import("./pages/blog-section/BlogGrid"));
const Contact = dynamic(() => import("./pages/contact-section/Contact"));
const Footer = dynamic(() => import("./components/Footer"));

export default function Home() {
  const blobityInstance = useBlobity(initialBlobityOptions);

  useEffect(() => {
    if (blobityInstance.current) {
      // @ts-ignore for debugging purposes or playing around
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

      <NavBar />

      {/* <ScrollerMotion> */}
      <main className="flex flex-col items-center justify-center">
        <Hero />
        <Work />
        {/* <Reviews/> */}
        <About />
        <Blog />
        <Contact />
        <Footer />
      </main>
      {/* </ScrollerMotion> */}
    </>
  );
}
