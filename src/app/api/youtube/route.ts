import { NextResponse } from "next/server";
import { fetchPlaylistSongs } from "@/lib/youtube";

export async function GET() {
  try {
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!playlistId || !apiKey) {
      console.error(
        "YouTube Playlist ID or API Key is not set in environment variables."
      );
      return NextResponse.json(
        {
          error: "Configuration error: YouTube playlist data cannot be loaded.",
        },
        { status: 500 }
      );
    }

    const songs = await fetchPlaylistSongs(playlistId, apiKey);

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error("Error fetching YouTube playlist songs:", error);
    return NextResponse.json(
      { error: "Failed to load songs from YouTube playlist." },
      { status: 500 }
    );
  }
}
