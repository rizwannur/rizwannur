'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

export function SearchInput({
  defaultValue = '',
  placeholder = 'Search...',
  resultCount,
}: {
  defaultValue?: string
  placeholder?: string
  resultCount?: number
}) {
  const [value, setValue] = useState(defaultValue)
  const router = useRouter()
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const updateURL = useCallback(
    (q: string) => {
      const url = q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname
      router.replace(url)
    },
    [pathname, router],
  )

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateURL(value)
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [value, updateURL])

  const clear = () => {
    setValue('')
    router.replace(pathname)
  }

  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/8 dark:border-white/8 text-[14px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-black/20 dark:focus:border-white/15 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {value && resultCount !== undefined && (
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          {resultCount === 0
            ? `No results for "${value}"`
            : `${resultCount} result${resultCount === 1 ? '' : 's'} for "${value}"`}
        </p>
      )}
    </div>
  )
}
