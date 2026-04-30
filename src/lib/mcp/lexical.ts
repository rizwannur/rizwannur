import {
  convertMarkdownToLexical,
  convertLexicalToMarkdown,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import payloadConfig from '@payload-config'

type EditorConfig = Awaited<ReturnType<typeof editorConfigFactory.default>>

let cachedConfig: EditorConfig | null = null

async function getEditorConfig(): Promise<EditorConfig> {
  if (!cachedConfig) {
    cachedConfig = await editorConfigFactory.default({ config: await payloadConfig })
  }
  return cachedConfig
}

const PLACEHOLDER_PREFIX = '__CODEBLOCK_'
const PLACEHOLDER_SUFFIX = '__'
const FENCE_RE = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g

type SerializedCodeBlock = {
  type: 'block'
  version: 2
  format: ''
  fields: {
    blockType: 'code'
    code: string
    language: string
  }
}

type RootChild = { type: string; children?: { type: string; text?: string }[] }

export async function markdownToLexical(markdown: string): Promise<SerializedEditorState> {
  const codeBlocks: { language: string; code: string }[] = []
  const stripped = markdown.replace(FENCE_RE, (_, lang: string, code: string) => {
    const idx = codeBlocks.length
    codeBlocks.push({
      language: (lang || 'plaintext').toLowerCase(),
      code: code.replace(/\s+$/, ''),
    })
    return `${PLACEHOLDER_PREFIX}${idx}${PLACEHOLDER_SUFFIX}`
  })

  const editorConfig = await getEditorConfig()
  const result = await convertMarkdownToLexical({ markdown: stripped, editorConfig })

  if (codeBlocks.length === 0) return result

  const root = result.root as unknown as { children: RootChild[] }
  const next: RootChild[] = []
  const placeholderRe = new RegExp(`^${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}$`)

  for (const node of root.children) {
    if (
      node.type === 'paragraph' &&
      node.children?.length === 1 &&
      node.children[0]?.type === 'text' &&
      typeof node.children[0].text === 'string'
    ) {
      const match = placeholderRe.exec(node.children[0].text.trim())
      if (match) {
        const idx = Number(match[1])
        const blk = codeBlocks[idx]
        if (blk) {
          const codeBlockNode: SerializedCodeBlock = {
            type: 'block',
            version: 2,
            format: '',
            fields: { blockType: 'code', code: blk.code, language: blk.language },
          }
          next.push(codeBlockNode as unknown as RootChild)
          continue
        }
      }
    }
    next.push(node)
  }

  root.children = next
  return result
}

export async function lexicalToMarkdown(data: unknown): Promise<string> {
  if (!data) return ''
  const editorConfig = await getEditorConfig()
  return convertLexicalToMarkdown({
    data: data as SerializedEditorState,
    editorConfig,
  })
}
