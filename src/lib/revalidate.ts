import { revalidatePath } from 'next/cache'

export function revalidateSection(section: 'thoughts' | 'work' | 'craft') {
  try {
    revalidatePath('/')
    revalidatePath(`/${section}`)
    revalidatePath(`/${section}/[slug]`, 'page')
  } catch { /* hook may run during build/seed where revalidatePath isn't usable */ }
}

export function revalidateProfile() {
  try {
    revalidatePath('/')
  } catch { /* ignore */ }
}
