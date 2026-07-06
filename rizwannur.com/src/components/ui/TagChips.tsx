type TagChipsProps = {
  tags: string[]
  className?: string
}

export function TagChips({ tags, className = '' }: TagChipsProps) {
  if (!tags?.length) return null
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[11px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
