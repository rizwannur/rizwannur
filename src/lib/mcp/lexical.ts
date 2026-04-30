import {
  convertMarkdownToLexical,
  convertLexicalToMarkdown,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import payloadConfig from '@payload-config'

let cachedConfig: unknown = null

async function getEditorConfig(): Promise<unknown> {
  if (!cachedConfig) {
    cachedConfig = await editorConfigFactory.default({ config: payloadConfig as any })
  }
  return cachedConfig
}

export async function markdownToLexical(markdown: string): Promise<SerializedEditorState> {
  const editorConfig = await getEditorConfig()
  return convertMarkdownToLexical({ markdown, editorConfig: editorConfig as any })
}

export async function lexicalToMarkdown(data: unknown): Promise<string> {
  if (!data) return ''
  const editorConfig = await getEditorConfig()
  return convertLexicalToMarkdown({
    data: data as SerializedEditorState,
    editorConfig: editorConfig as any,
  })
}
