"use client";
import Link from "next/link";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Type assertion for FontAwesome icons to fix compatibility issues
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
const pdfIcon = faFilePdf as IconDefinition;
import { Button } from "@/components/ui/button";
import { NavbarProps } from "@/lib/types";
import { navbarData } from "@/data/navbar";

const NavBar: React.FC<NavbarProps> = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // first prevent the default behavior
    e.preventDefault();
    // get the href and remove everything before the hash (#)
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    // get the element by id and use scrollIntoView
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <nav className="fixed bottom-10 left-0 right-0 z-50 my-0 mx-auto flex w-[306px] items-center justify-center gap-1 rounded-lg bg-[#07070a]/90 px-1 py-1 text-[#e4ded7] backdrop-blur-md sm:w-[383.3px] md:p-2 lg:w-[391.3px]">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="flex p-2 text-[16px] hover:bg-[#e4ded7]/10 sm:px-4 md:py-1"
      >
        <Link
          href={navbarData.resumeUrl}
          target="_blank"
          aria-label={navbarData.resumeAriaLabel}
          data-blobity-tooltip={navbarData.resumeTooltip}
          data-blobity-magnetic="false"
        >
          <FontAwesomeIcon icon={pdfIcon} />
        </Link>
      </Button>

      {navbarData.navigationLinks.map((link) => (
        <Button
          key={link.href}
          asChild
          variant="ghost"
          size="sm"
          className="rounded px-2 py-2 text-xs hover:bg-[#e4ded7]/10 sm:px-4 sm:text-sm md:px-4 md:py-1"
        >
          <Link
            href={link.href}
            data-blobity-magnetic="false"
            onClick={handleScroll}
            aria-label={link.ariaLabel}
          >
            {link.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
};

export default NavBar;
