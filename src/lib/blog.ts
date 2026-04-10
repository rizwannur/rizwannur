const BLOG_BASE = "https://blog.rizwannur.com";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedDate: string;
  readingTime: number;
  featuredImage: {
    url: string;
    alt: string;
  } | null;
  categories: Array<{ name: string; slug: string }>;
}

export async function getLatestPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${BLOG_BASE}/api/posts?limit=${limit}&where[status][equals]=published&sort=-publishedDate&depth=1`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const docs = data.docs ?? [];

    return docs.map((doc: Record<string, unknown>) => {
      const fi = doc.featuredImage as Record<string, string> | null | undefined;
      return {
        id: doc.id as string,
        title: doc.title as string,
        slug: doc.slug as string,
        excerpt: doc.excerpt as string ?? "",
        publishedDate: (doc.publishedDate ?? doc.createdAt) as string,
        readingTime: (doc.readingTime as number) ?? 0,
        featuredImage: fi?.url
          ? {
              url: fi.url.startsWith("http") ? fi.url : `${BLOG_BASE}${fi.url}`,
              alt: fi.alt ?? (doc.title as string),
            }
          : null,
        categories: (doc.categories as Array<{ name: string; slug: string }>) ?? [],
      };
    });
  } catch {
    return [];
  }
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function postUrl(slug: string): string {
  return `${BLOG_BASE}/posts/${slug}`;
}
