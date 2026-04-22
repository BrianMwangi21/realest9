# Realest 9 — Mallory Bros Game Show

A game show for the Mallory Bros community. Test your knowledge of the podcast with 9 rapid-fire questions. **90 seconds total.** Answer fast, score high, share your rank.

Built for [@mallorybrospodcast](https://www.youtube.com/@mallorybrospodcast/videos).

---

## How to Play

1. **Hit Start Game**
2. **Answer 9 questions** — episode titles, view counts, chronology, and more
3. **Beat the clock** — you have 90 seconds total for all 9 questions
4. **Get your rank** — Mallory Master, Realest 9, Bro in Training, or New Listener
5. **Share your score**

---

## Stack

- Next.js 16 + React 19
- Tailwind CSS v4
- YouTube Data API v3

---

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your YOUTUBE_API_KEY to .env

# Fetch latest episode data
npx tsx scripts/fetch-youtube-data.ts

# Run dev server
npm run dev
```

---

## Updating Episode Data

```bash
npx tsx scripts/fetch-youtube-data.ts
```

This fetches the latest 100 videos from the Mallory Bros channel and saves them to `app/data/episodes.json`.

---

## Deploy

```bash
npm run build
```

Static export ready for Vercel, Netlify, or any static host.

---

**Realest 9. Game show for Mallory Bros. Made for the community.**
