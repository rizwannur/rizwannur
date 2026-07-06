<div align="center">

# rizwannur.com

Source for [rizwannur.com](https://www.rizwannur.com) — my personal site, blog, and portfolio.

Built on [Payload CMS](https://payloadcms.com) 3.0 and Next.js, with content (posts, work, media) managed through Payload's admin panel and rendered by a Next.js App Router front end.

[Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Scripts](#-available-scripts) • [Structure](#-project-structure) • [Links](#-links)

</div>

---

### 🧪 Tech Stack

![Next.js](https://img.shields.io/badge/-Next.js%2016-05122A?style=flat&logo=next.js)&nbsp;
![React](https://img.shields.io/badge/-React%2019-05122A?style=flat&logo=react)&nbsp;
![TypeScript](https://img.shields.io/badge/-TypeScript-05122A?style=flat&logo=typescript)&nbsp;
![Payload CMS](https://img.shields.io/badge/-Payload%20CMS%203-05122A?style=flat&logo=payloadcms)&nbsp;
![MongoDB](https://img.shields.io/badge/-MongoDB-05122A?style=flat&logo=mongodb)&nbsp;
![TailwindCSS](https://img.shields.io/badge/-Tailwind%20CSS%204-05122A?style=flat&logo=tailwind-css)&nbsp;
![Vercel](https://img.shields.io/badge/-Vercel-05122A?style=flat&logo=vercel)&nbsp;
![Zod](https://img.shields.io/badge/-Zod-05122A?style=flat&logo=zod)&nbsp;
![ESLint](https://img.shields.io/badge/-ESLint-05122A?style=flat&logo=eslint)&nbsp;
![bun](https://img.shields.io/badge/-bun-05122A?style=flat&logo=bun)

**How it's put together**

- **Payload CMS** powers the content layer — collections for Users (auth) and Media live under `src/collections`, configured in `src/payload.config.ts`.
- **MongoDB** is the database, via `@payloadcms/db-mongodb`.
- **Vercel Blob** handles media storage in production, via `@payloadcms/storage-vercel-blob`.
- **Next.js App Router** (`src/app`) renders the public site and the Payload admin UI side by side.
- **SEO** and **Search** plugins (`@payloadcms/plugin-seo`, `@payloadcms/plugin-search`) are wired in for metadata and on-site search.
- **Vercel Analytics** and **Speed Insights** track real-world performance.

---

### 🚀 Getting Started

This project uses [bun](https://bun.sh) as the package manager and runtime.

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in the values (database connection string, Payload secret, blob storage token, etc.):

   ```bash
   cp .env.example .env
   ```

3. **Run the dev server**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) for the site, and `/admin` for the Payload admin panel. Follow the on-screen prompts to create your first admin user.

---

### 📜 Available Scripts

| Command | What it does |
|---|---|
| `bun dev` | Start the dev server |
| `bun devsafe` | Wipe `.next` and start the dev server clean (use if you hit stale build weirdness) |
| `bun run build` | Production build |
| `bun start` | Run the production build |
| `bun run lint` | Lint the codebase |
| `bun run type-check` | Type-check with `tsc --noEmit` |
| `bun run payload` | Run the Payload CLI |
| `bun run generate:types` | Regenerate `src/payload-types.ts` from your Payload config |
| `bun run generate:importmap` | Regenerate the Payload admin import map |

---

### 📁 Project Structure

```
rizwannur.com/
├── src/
│   ├── app/            # Next.js routes (public site + Payload admin)
│   ├── collections/    # Payload collections (Users, Media, etc.)
│   ├── components/     # Shared React components
│   ├── lib/            # Utilities and helpers
│   └── payload.config.ts
├── public/             # Static assets
├── scripts/            # Maintenance/build scripts
└── docs/               # Project docs
```

---

### 🔗 Links

- Live site: [rizwannur.com](https://www.rizwannur.com)
- Part of the [rizwannur](../) repo, merged in with full commit history preserved.
