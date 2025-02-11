export type SongProps = {
  title: string;
  artist: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  link: string;
};

// Helper function reminder
const ytSong = (vid: string, title: string, artist: string) => ({
  title,
  artist,
  image: {
    src: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
    width: 480,
    height: 480,
  },
  link: `https://music.youtube.com/watch?v=${vid}`,
});
// Helper function for YouTube Music assets with 1:1 ratio
export const songs: SongProps[] = [

  ytSong('YzCZJLOSpxk', 'Divine', 'Krishnahazar'),
  ytSong('ny3oWUnm2Mk', 'Tomake Chai', 'Arijit Singh, Vishal & Shekhar'),
  ytSong('9jdLnFYQh4s', 'All the stars', 'Kendrick Lamar & SZA'),
  ytSong('sEetXo3R-aM', 'Diet Mountain Dew', 'Lana Del Rey'),
  ytSong('1-fDgT5ze84', 'I like me better', 'Lauv'),
  ytSong('r7Rn4ryE_w8', 'Sunflower', 'Post Malone & Swae Lee'),
  ytSong('1fJQCPMd8pc', 'River', 'Anonymouz'),
  ytSong('NIma5XOxBq0', 'Softcore', 'The Neighbourhood'),
  ytSong('MHCsrKA9gh8', 'Blue', 'Yung kai'),
  ytSong('6FewJvQDTmA', 'Co2', 'Prateek Kuhad'),
  ytSong('XXZ-tiFFJEg', 'Sadqay', 'Nehaal Naseem'),

];
