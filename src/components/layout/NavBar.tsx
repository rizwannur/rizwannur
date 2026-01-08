"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PhoneCall } from "lucide-react";

// Type assertion for FontAwesome icons to fix compatibility issues
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
const pdfIcon = faFilePdf as IconDefinition;
import { Button } from "@/components/ui/button";
import { NavbarProps } from "@/lib/types";
import { NAV_RESUME_URL, NAV_RESUME_ARIA_LABEL, NAV_RESUME_TOOLTIP, NAV_LINKS } from "@/data/Globals"; // Import from Globals.ts
import { heroData } from "@/data/HeroSection";

const NavBar: React.FC<NavbarProps> = () => {
  const pathname = usePathname();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const hrefAttr = e.currentTarget.getAttribute("href") ?? "";
    if (!hrefAttr.includes("#")) return;

    // Only smooth-scroll on the homepage; otherwise allow normal navigation.
    if (pathname !== "/") return;

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
        className="flex p-2 text-[16px] hover:bg-[#e4ded7]/10 sm:hidden"
      >
        <Link
          href={heroData.callUrl}
          target="_blank"
          aria-label="Book a call"
          data-blobity-magnetic="false"
        >
          <PhoneCall className="h-4 w-4" />
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="flex p-2 text-[16px] hover:bg-[#e4ded7]/10 sm:px-4 md:py-1"
      >
        <Link
          href={NAV_RESUME_URL} // Using constant
          target="_blank"
          aria-label={NAV_RESUME_ARIA_LABEL} // Using constant
          data-blobity-tooltip={NAV_RESUME_TOOLTIP} // Using constant
          data-blobity-magnetic="false"
        >
          <FontAwesomeIcon icon={pdfIcon} />
        </Link>
      </Button>

      {NAV_LINKS.map((link) => ( // Using constant
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
