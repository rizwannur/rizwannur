import { Song } from "./types";

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeThumbnails {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
  standard?: YouTubeThumbnail; // Added standard thumbnail type
  maxres?: YouTubeThumbnail; // Added maxres thumbnail type
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
 * Gets the highest quality thumbnail available for a YouTube video.
 * Tries direct YouTube thumbnail URLs for maximum resolution before falling back to API thumbnails.
 * @param videoId The YouTube video ID
 * @param thumbnails The thumbnails object from the YouTube API
 * @returns The URL of the highest quality thumbnail
 */
function getHighestQualityThumbnail(
  videoId: string,
  thumbnails: YouTubeThumbnails
): string {
  // Try direct YouTube thumbnail URLs for potentially higher quality
  // These URLs follow YouTube's direct thumbnail pattern
  const directThumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // 1280x720 (if available)
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, // 640x480
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // 480x360
  ];

  // For the highest quality, we'll use the API thumbnails as they're guaranteed to exist
  // But you could implement a fallback check to the direct URLs if needed
  return (
    thumbnails.maxres?.url || // 1280x720 (highest from API)
    thumbnails.standard?.url || // 640x480
    thumbnails.high?.url || // 480x360
    thumbnails.medium?.url || // 320x180
    thumbnails.default.url || // 120x90
    directThumbnailUrls[2] // Fallback to direct URL
  );
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
    part: "snippet",
    playlistId: playlistId,
    key: apiKey,
    maxResults: "20", // Fetch up to 20 items. Adjust as needed.
  });

  try {
    const response = await fetch(`${youtubeApiUrl}?${params.toString()}`);
    if (!response.ok) {
      let errorMessage = `Failed to fetch YouTube playlist: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("YouTube API error:", errorData);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // If response is not JSON, use the response text for debugging
        const responseText = await response.text();
        console.error("Non-JSON error response:", responseText);
      }
      throw new Error(errorMessage);
    }
    const data: YouTubePlaylistResponse = await response.json();

    const songs: Song[] = data.items.map((item) => {
      const { snippet } = item;
      const artist =
        snippet.videoOwnerChannelTitle ||
        snippet.channelTitle ||
        "Unknown Artist";
      const title = snippet.title
        .replace(/ *\([^)]*\) */g, "")
        .replace(/ *\[[^\]]*\] */g, "")
        .trim(); // Clean title from common bracketed info
      // Get the highest quality thumbnail available
      // YouTube provides these thumbnail sizes:
      // maxres: 1280x720 (only for HD videos)
      // standard: 640x480
      // high: 480x360
      // medium: 320x180
      // default: 120x90
      const image = getHighestQualityThumbnail(
        snippet.resourceId.videoId,
        snippet.thumbnails
      );

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
