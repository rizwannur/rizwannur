import { Song } from '../lib/types';
import lieAgainImage from "../../public/songs/lie-again.jpeg";
import martinsSofaImage from "../../public/songs/martins-sofa.jpg";
import letMeGoImage from "../../public/songs/let-me-go.jpg";
import oneUpImage from "../../public/songs/one-up.png";
import glitterImage from "../../public/songs/glitter.jpg";
import lemmeLandImage from "../../public/songs/lemme-land.jpg";
import floodsImage from "../../public/songs/floods.jpg";
import niceAndGoodImage from "../../public/songs/nice-and-good.jpg";
import careImage from "../../public/songs/care.jpg";
import doubleZeroImage from "../../public/songs/22-double-0.jpg";

/**
 * Songs data
 */
export const songs: Song[] = [
  {
    title: "Lie Again",
    artist: "Giveon",
    image: lieAgainImage,
    link: "https://open.spotify.com/album/11q4Tt1RzwrFzF2Vddc2yO",
  },
  {
    title: "Martin's Sofa",
    artist: "Headie One",
    image: martinsSofaImage,
    link: "https://open.spotify.com/album/5ywIBJnydB9IMqgg0XDU6O",
  },
  {
    title: "Let Me Go",
    artist: "Daniel Ceasar",
    image: letMeGoImage,
    link: "https://open.spotify.com/track/4AwJSk491AvHk2AAJReGzZ",
  },
  {
    title: "One Up",
    artist: "Central Cee",
    image: oneUpImage,
    link: "https://open.spotify.com/album/51A9bnCs9oq6vjFZIDza97",
  },
  {
    title: "Glitter",
    artist: "BENEE",
    image: glitterImage,
    link: "https://open.spotify.com/track/23TPP1eeElFfvYVznskwCY",
  },
  {
    title: "Lemme Land?",
    artist: "Canking, Ess2Mad",
    image: lemmeLandImage,
    link: "https://open.spotify.com/track/4Fmr4dbY1sZiX77ZbljNFC",
  },
  {
    title: "Floods",
    artist: "Lucky Daye",
    image: floodsImage,
    link: "https://open.spotify.com/track/4GBjdj1z74h8RVr1Us6YFc",
  },
  {
    title: "Nice & Good",
    artist: "SL, Knucks",
    image: niceAndGoodImage,
    link: "https://open.spotify.com/album/2nZHGm0LbyWb9SQ48RWFdO",
  },
  {
    title: "Care",
    artist: "Sonder",
    image: careImage,
    link: "https://open.spotify.com/track/3tkxfORwPo2zydAf25YFOc",
  },
  {
    title: "22 Double 0",
    artist: "Unknown T",
    image: doubleZeroImage,
    link: "https://open.spotify.com/track/0L0sXaqVYGpvXWcikG6zlk",
  },
];

/**
 * Validates a song object
 * @param song The song to validate
 * @returns True if the song is valid, false otherwise
 */
export function validateSong(song: Partial<Song>): song is Song {
  return (
    typeof song.title === 'string' &&
    typeof song.artist === 'string' &&
    !!song.image &&
    typeof song.link === 'string'
  );
}