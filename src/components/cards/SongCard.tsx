import Image from "next/image";
import { SongCardProps } from "@/lib/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";

const SongCard = ({ song }: SongCardProps) => {
  const { title, artist, image, link } = song;

  return (
    <Link href={link} target="_blank" aria-label={`Check out ${title} by ${artist} on YouTube`}>
      <Card className="group relative flex h-[200px] w-[200px] items-center justify-center overflow-hidden border-none shadow-none p-0 transition-transform duration-300 hover:scale-105 sm:h-[220px] sm:w-[220px] md:h-[250px] md:w-[250px] lg:h-[280px] lg:w-[280px]">
        <Image
          src={image}
          alt={`${title} by ${artist}`}
          className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
          fill
          sizes="(max-width: 640px) 200px, (max-width: 768px) 220px, (max-width: 1024px) 250px, 280px"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

        {/* Text overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <p className="text-xs text-white/90 font-medium truncate">{artist}</p>
          <h4 className="text-sm font-bold text-white truncate">{title}</h4>
        </div>
      </Card>
    </Link>
  );
};

export default SongCard;