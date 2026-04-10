/** Edge-safe PNG data URL for @vercel/og <img src={...} /> */
export function arrayBufferToPngDataUrl(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:image/png;base64,${btoa(binary)}`;
}
