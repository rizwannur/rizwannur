'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Resolved = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: Resolved
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'theme'

function systemPref(): Resolved {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {}
  return 'system'
}

function applyClass(resolved: Resolved) {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<Resolved>('light')

  useEffect(() => {
    const stored = readStored()
    const resolved = stored === 'system' ? systemPref() : stored
    setThemeState(stored)
    setResolvedTheme(resolved)
    applyClass(resolved)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      if (readStored() !== 'system') return
      const next = mq.matches ? 'dark' : 'light'
      setResolvedTheme(next)
      applyClass(next)
    }
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [])

  const setTheme = (next: Theme) => {
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {}
    const resolved = next === 'system' ? systemPref() : next
    setThemeState(next)
    setResolvedTheme(resolved)
    applyClass(resolved)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => {},
    }
  }
  return ctx
}

// Inline script emitted in <head> to apply the theme class before paint.
// Stringified and dropped via dangerouslySetInnerHTML in layout — runs on
// document parse, so there's no flash of the wrong theme.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var d=t==='dark'||((t==null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`
