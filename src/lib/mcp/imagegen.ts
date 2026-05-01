import { GoogleGenAI, Modality } from '@google/genai'
import { getPayload } from 'payload'
import config from '@payload-config'

export type AspectRatio = '16:9' | '4:3' | '1:1' | '3:4'
export type ImagePurpose = 'cover' | 'inline'

export type GeneratedImage = {
  mediaId: number
  url: string
  alt: string
  prompt: string
}

const ASPECT_HINTS: Record<AspectRatio, string> = {
  '16:9': 'Composed for a 16:9 widescreen aspect ratio.',
  '4:3': 'Composed for a 4:3 aspect ratio.',
  '1:1': 'Composed for a 1:1 square aspect ratio.',
  '3:4': 'Composed for a 3:4 portrait aspect ratio.',
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your environment to use generate_image. Get a key at https://aistudio.google.com/apikey.',
    )
  }
  return new GoogleGenAI({ apiKey })
}

async function callGemini(prompt: string, aspectRatio: AspectRatio): Promise<{ data: Buffer; mimeType: string }> {
  const client = getClient()
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n${ASPECT_HINTS[aspectRatio]}` }] }],
    config: {
      responseModalities: [Modality.IMAGE],
    },
  })

  const parts = response.candidates?.[0]?.content?.parts ?? []
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData
    if (inline?.data) {
      return {
        data: Buffer.from(inline.data, 'base64'),
        mimeType: inline.mimeType ?? 'image/png',
      }
    }
  }

  const blockReason =
    (response as { promptFeedback?: { blockReason?: string } }).promptFeedback?.blockReason ?? null
  throw new Error(
    blockReason
      ? `Gemini refused the prompt (${blockReason}). Rewrite the prompt to avoid restricted content and retry.`
      : 'Gemini returned no image data. Retry with a clearer or more specific prompt.',
  )
}

function extFromMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('jpeg')) return 'jpg'
  if (mime.includes('webp')) return 'webp'
  return 'png'
}

export async function generateImage(args: {
  prompt: string
  alt: string
  purpose: ImagePurpose
  aspectRatio?: AspectRatio
  filename?: string
}): Promise<GeneratedImage> {
  const aspect = args.aspectRatio ?? (args.purpose === 'cover' ? '16:9' : '4:3')
  const { data, mimeType } = await callGemini(args.prompt, aspect)
  const payload = await getPayload({ config })
  const safeSlug = args.alt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'image'
  const ext = extFromMime(mimeType)
  const name = args.filename ?? `${args.purpose}-${safeSlug}-${Date.now()}.${ext}`

  const media = (await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: args.alt },
    file: { data, mimetype: mimeType, name, size: data.byteLength },
  })) as unknown as { id: number; url: string }

  return { mediaId: media.id, url: media.url, alt: args.alt, prompt: args.prompt }
}
