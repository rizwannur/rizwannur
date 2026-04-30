export type Thought = {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  body: string[]
}

export const thoughts: Thought[] = [
  {
    slug: 'building-a-fast-portfolio-with-nextjs',
    title: 'Building a fast portfolio with Next.js',
    date: 'Apr 2026',
    readTime: '6 min read',
    excerpt: 'Notes on shipping a portfolio that loads instantly and still feels alive.',
    body: [
      'Speed and personality are usually treated like opposites. They aren\'t.',
      'A portfolio that loads instantly buys you the right to be a little bit weird—you\'ve already paid the politeness tax in performance, so you can spend the rest on craft.',
      'In this post I walk through the choices that kept this site under 100 KB of JS while still having the animations and audio I wanted.',
    ],
  },
  {
    slug: 'view-transitions-for-theme-switching',
    title: 'Using View Transitions for theme switching',
    date: 'Mar 2026',
    readTime: '8 min read',
    excerpt: 'A circular wipe between light and dark with the View Transitions API and zero libraries.',
    body: [
      'The View Transitions API is one of those quiet, recent additions to the platform that lets you do things that used to require a small ML of JS.',
      'I show how to wire it up in a Next.js app with next-themes, and how to make the wipe feel intentional rather than gimmicky.',
    ],
  },
  {
    slug: 'why-i-care-about-craft',
    title: 'Why I care about craft',
    date: 'Feb 2026',
    readTime: '5 min read',
    excerpt: 'A short essay on the kind of attention that separates good interfaces from great ones.',
    body: [
      'Craft is the part you notice when it\'s done right and miss when it\'s not.',
      'It\'s the easing curve on a button, the empty state that doesn\'t feel empty, the loading spinner that admits something is taking too long.',
    ],
  },
  {
    slug: 'a-quiet-design-system',
    title: 'A quiet design system',
    date: 'Jan 2026',
    readTime: '7 min read',
    excerpt: 'On building component libraries that recede into the background—on purpose.',
    body: [
      'The best design systems disappear. You stop noticing them, and you start noticing the products built on top.',
      'Here\'s how I think about token layering, escape hatches, and the decisions that decide whether a system gets adopted or quietly worked around.',
    ],
  },
]
