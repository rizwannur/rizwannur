// SongCarousel.tsx
import SongCard from "./SongCard";
import { songs } from "./songDetails";
import "../../animations/animate.css";

const SongCarousel = () => {
  return (
    <div className="animate absolute bottom-5 flex w-[400%] border-[1px] border-[#0E1016] sm:w-[300%] md:w-[250%] lg:w-[200%] xl:w-[150%]">
      <div className="mx-auto flex w-full gap-3 px-4 py-2 sm:gap-4 md:gap-5">
        {songs.map((song, index) => (
          <SongCard
            key={`${song.title}-${index}`}
            title={song.title}
            artist={song.artist}
            image={song.image}
            link={song.link}
          />
        ))}
      </div>
    </div>
  );
};

export default SongCarousel;