import React from "react";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0E1016] text-[#e4ded7] gap-5 px-4">
      <p className="text-[25px] sm:text-[30px] md:text-[35px] lg:text-[40px] uppercase font-bold tracking-wide text-center">
        blud done got lost 💀🙏🏻🙏🏻
      </p>
      <Image
        src="https://media.tenor.com/wN1UFzPRuYYAAAAM/spider-man-tobey-maguire.gif"
        alt="Funny Meme"
        width={858}
        height={483}
        className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] rounded-md shadow-lg"
        priority
      />
      <Link
        href="/"
        className="text-[25px] sm:text-[30px] md:text-[35px] lg:text-[40px] uppercase font-semibold underline underline-offset-4 hover:text-[#ffb703] transition-colors duration-300"
        aria-label="Go back to portfolio homepage"
      >
        Head back to my <span>Portfolio</span>
      </Link>
    </div>
  );
};

export default NotFound;
