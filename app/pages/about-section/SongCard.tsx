// SongCard.tsx
import Image from "next/image";
import { SongProps } from "./songDetails";
import Link from "next/link";

const SongCard = ({ title, artist, image, link }: SongProps) => {
  return (
    <Link href={link} target="_blank" aria-label={`Check out ${title} by ${artist}`}>
      <div className="relative aspect-square h-[150px] w-[150px] overflow-hidden rounded-xl sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px] lg:h-[220px] lg:w-[220px]">
        <Image
          src={image.src}
          alt={`${title} - ${artist}`}
          width={image.width}
          height={image.height}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-sm font-medium sm:text-base">{artist}</p>
          <h4 className="line-clamp-1 text-lg font-bold sm:text-xl">{title}</h4>
        </div>
      </div>
    </Link>
  );
};

export default SongCard;