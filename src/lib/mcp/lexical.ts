import {
  convertMarkdownToLexical,
  convertLexicalToMarkdown,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import payloadConfig from '@payload-config'
import type { CollectionSlug, RichTextField, SanitizedConfig } from 'payload'

type EditorConfig = ReturnType<typeof editorConfigFactory.fromField>

const cache = new Map<string, EditorConfig>()

async function getFieldEditorConfig(
  collection: CollectionSlug,
  fieldName: string,
): Promise<EditorConfig> {
  const key = `${collection}.${fieldName}`
  const cached = cache.get(key)
  if (cached) return cached

  const cfg = (await payloadConfig) as SanitizedConfig
  const coll = cfg.collections.find((c) => c.slug === collection)
  if (!coll) throw new Error(`Collection ${collection} not found`)
  const field = coll.fields.find(
    (f) => 'name' in f && (f as { name?: string }).name === fieldName,
  ) as RichTextField | undefined
  if (!field) throw new Error(`Field ${fieldName} not found on ${collection}`)

  const editorConfig = editorConfigFactory.fromField({ field })
  cache.set(key, editorConfig)
  return editorConfig
}

const ALLOWED_LANGUAGES = new Set([
  'plaintext',
  'js',
  'ts',
  'tsx',
  'jsx',
  'css',
  'html',
  'json',
  'bash',
  'sh',
  'md',
  'sql',
  'py',
  'go',
  'rust',
  'yaml',
])
const LANGUAGE_ALIASES: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  shell: 'sh',
  zsh: 'sh',
  python: 'py',
  golang: 'go',
  rs: 'rust',
  yml: 'yaml',
  markdown: 'md',
  text: 'plaintext',
  txt: 'plaintext',
}

function normalizeLanguage(lang: string): string {
  const lower = (lang || '').toLowerCase()
  if (!lower) return 'plaintext'
  const aliased = LANGUAGE_ALIASES[lower] ?? lower
  return ALLOWED_LANGUAGES.has(aliased) ? aliased : 'plaintext'
}

const FENCE_HEADER_RE = /^([ \t]*)```([a-zA-Z0-9_+-]+)[ \t]*$/gm

type CodeBlockField = { fields?: { blockType?: string; language?: string } }

export type FieldRef = { collection: CollectionSlug; field: string }

export async function markdownToLexical(
  markdown: string,
  ref: FieldRef,
): Promise<SerializedEditorState> {
  const sanitized = markdown.replace(FENCE_HEADER_RE, (_match, indent: string, lang: string) => {
    return `${indent}\`\`\`${normalizeLanguage(lang)}`
  })

  const editorConfig = await getFieldEditorConfig(ref.collection, ref.field)
  const result = await convertMarkdownToLexical({ markdown: sanitized, editorConfig })

  const root = result.root as unknown as { children: CodeBlockField[] }
  for (const node of root.children) {
    if (node?.fields?.blockType === 'code') {
      node.fields.language = normalizeLanguage(node.fields.language ?? '')
    }
  }

  return result
}

export async function lexicalToMarkdown(data: unknown, ref: FieldRef): Promise<string> {
  if (!data) return ''
  const editorConfig = await getFieldEditorConfig(ref.collection, ref.field)
  return convertLexicalToMarkdown({
    data: data as SerializedEditorState,
    editorConfig,
  })
}

const PLACEHOLDER_IMAGE_RE = /!\[([^\]]*)\]\((IMG_\d+)\)/g

export function substituteInlinePlaceholders(
  markdown: string,
  inlineImages: Record<string, { url: string; alt?: string }>,
): string {
  return markdown.replace(PLACEHOLDER_IMAGE_RE, (_match, alt: string, key: string) => {
    const ref = inlineImages[key]
    if (!ref) return _match
    const safeAlt = (alt || ref.alt || '').replace(/"/g, '\\"')
    return `![${safeAlt}](${ref.url})`
  })
}
