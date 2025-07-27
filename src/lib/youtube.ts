import { Song } from './types';

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeThumbnails {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
  videoOwnerChannelTitle?: string;
  videoOwnerChannelId?: string;
}

interface YouTubePlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeSnippet;
}

interface YouTubePlaylistResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubePlaylistItem[];
}

/**
 * Fetches songs from a given YouTube playlist ID.
 * @param playlistId The ID of the YouTube playlist.
 * @param apiKey Your YouTube Data API key.
 * @returns A promise that resolves to an array of Song objects.
 */
export async function fetchPlaylistSongs(
  playlistId: string,
  apiKey: string
): Promise<Song[]> {
  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems`;
  const params = new URLSearchParams({
    part: 'snippet',
    playlistId: playlistId,
    key: apiKey,
    maxResults: '20', // Fetch up to 20 items. Adjust as needed.
  });

  try {
    const response = await fetch(`${youtubeApiUrl}?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      throw new Error(`Failed to fetch YouTube playlist: ${response.statusText}`);
    }
    const data: YouTubePlaylistResponse = await response.json();

    const songs: Song[] = data.items.map((item) => {
      const { snippet } = item;
      const artist = snippet.videoOwnerChannelTitle || snippet.channelTitle || "Unknown Artist";
      const title = snippet.title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*\] */g, "").trim(); // Clean title from common bracketed info
      const image = snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default.url;
      const link = `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`;

      return {
        title: title,
        artist: artist,
        image: image,
        link: link,
      };
    });
    return songs;
  } catch (error) {
    console.error("Error fetching YouTube playlist songs:", error);
    return [];
  }
}