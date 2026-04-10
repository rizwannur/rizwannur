import { ImageResponse } from "next/og";

import { arrayBufferToPngDataUrl } from "@/lib/array-buffer-to-data-url";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rizwannur.com";

  const profileImageResponse = await fetch(new URL("/hero-pfp.png", siteUrl), {
    // Social crawlers tend to re-request; keep it fresh-ish without being noisy.
    cache: "force-cache",
  }).catch(() => null);

  const profileImageArrayBuffer = profileImageResponse
    ? await profileImageResponse.arrayBuffer().catch(() => null)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(1200px 630px at 0% 0%, #1f2937 0%, #0E1016 55%, #090A0F 100%)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 60,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontWeight: 800,
              maxWidth: 720,
              whiteSpace: "pre-wrap",
            }}
          >
            Rizwan Nur
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.25,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 760,
              whiteSpace: "pre-wrap",
            }}
          >
            Systems architect for scalable products
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              rizwannur.com
            </div>
          </div>
        </div>

        {profileImageArrayBuffer ? (
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 999,
              overflow: "hidden",
              border: "2px solid rgba(255,255,255,0.16)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <img
              src={arrayBufferToPngDataUrl(profileImageArrayBuffer)}
              width={320}
              height={320}
              alt="Rizwan Nur"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            RN
          </div>
        )}
      </div>
    ),
    size,
  );
}

