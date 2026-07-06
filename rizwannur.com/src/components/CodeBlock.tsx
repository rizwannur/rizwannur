import { codeToHtml, type BundledLanguage } from 'shiki'

const SHIKI_LANG_ALIASES: Record<string, BundledLanguage> = {
  plaintext: 'text' as BundledLanguage,
  sh: 'bash',
}

const SUPPORTED_LANGS = new Set<string>([
  'js',
  'ts',
  'tsx',
  'jsx',
  'css',
  'html',
  'json',
  'bash',
  'md',
  'sql',
  'py',
  'go',
  'rust',
  'yaml',
])

function resolveLang(language: string): BundledLanguage {
  const lower = (language || '').toLowerCase()
  if (lower in SHIKI_LANG_ALIASES) return SHIKI_LANG_ALIASES[lower]!
  if (SUPPORTED_LANGS.has(lower)) return lower as BundledLanguage
  return 'text' as BundledLanguage
}

type Props = { code: string; language: string }

export async function CodeBlock({ code, language }: Props) {
  const lang = resolveLang(language)
  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    defaultColor: false,
  })

  return (
    <div
      className="rich-code-block"
      data-language={language || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
