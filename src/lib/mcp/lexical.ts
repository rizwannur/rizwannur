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

export async function markdownToLexical(markdown: string): Promise<SerializedEditorState> {
  const editorConfig = await getEditorConfig()
  return convertMarkdownToLexical({ markdown, editorConfig })
}

export async function lexicalToMarkdown(data: unknown): Promise<string> {
  if (!data) return ''
  const editorConfig = await getEditorConfig()
  return convertLexicalToMarkdown({
    data: data as SerializedEditorState,
    editorConfig,
  })
}
