# LegisTrack

**Track U.S. infrastructure, utilities, and telecom legislation in real time.**

LegisTrack monitors pending and current bills in the 119th Congress that impact infrastructure, energy, water, transportation, telecommunications, and broadband sectors. It pulls data from official government APIs so your dashboard always reflects the latest legislative activity.

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/legistrack.git
cd legistrack

# 2. Install dependencies
npm install

# 3. Copy the env file and add your API keys
cp .env.example .env

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app works immediately with seed data, even before you configure API keys.

---

## Data Sources

LegisTrack integrates with three free legislative APIs. You only need one key to get started, but using both primary sources gives the richest data.

### 1. Congress.gov API (Recommended — Primary)

The official API from the Library of Congress. Best for bill text, status, and action history.

- **Sign up:** https://api.congress.gov/sign-up/
- **Cost:** Free
- **Rate limit:** 5,000 requests/hour
- **Docs:** https://api.congress.gov/

### 2. LegiScan API (Recommended — Secondary)

Rich metadata, bill scoring, change tracking, and state-level data.

- **Sign up:** https://legiscan.com/legiscan
- **Cost:** Free tier = 30,000 calls/month
- **Rate limit:** 30k/month (free), higher on paid plans
- **Docs:** https://legiscan.com/legiscan

### 3. ProPublica Congress API (Optional — Enrichment)

Adds voting records, member data, and floor actions.

- **Sign up:** https://www.propublica.org/datastore/api/propublica-congress-api
- **Cost:** Free
- **Docs:** https://projects.propublica.org/api-docs/congress-api/

### Configuration

Add your keys to `.env`:

```env
VITE_CONGRESS_API_KEY=your_key_here
VITE_LEGISCAN_API_KEY=your_key_here
VITE_PROPUBLICA_API_KEY=your_key_here   # optional
VITE_POLL_INTERVAL_MINUTES=30           # auto-refresh interval
```

**Without any API keys**, the app displays curated seed data based on real 119th Congress bills so you can explore the UI immediately.

---

## How It Works

### Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Congress.gov │    │   LegiScan   │    │  ProPublica  │
│     API      │    │     API      │    │     API      │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────┬───────┘───────────────────┘
                   ▼
         ┌─────────────────┐
         │  Data Service   │  Fetch, classify, merge, deduplicate
         │  (dataService)  │
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │   Classifier    │  Keyword matching → sector/category/impact
         │  (classifier)   │
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │  Zustand Store  │  Central state + filtering + sorting
         │   (useStore)    │
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │   React UI      │  Dashboard, filters, detail panels
         └─────────────────┘
```

### Auto-Refresh

The app polls for new data on a configurable interval (default: 30 minutes). When a visitor loads the page, fresh data is fetched immediately. Subsequent updates happen silently in the background.

### Bill Classification

The `classifier.ts` module uses keyword matching to:
1. Determine if a bill is relevant to infrastructure/utilities/telecom
2. Assign it to one or more **sectors** (Telecom, Broadband, Energy, Water, etc.)
3. Set a primary **category** for filtering
4. Estimate an **impact level** (Critical, High, Medium, Low)
5. Generate **tags** for quick scanning

You can customize the keywords in `src/utils/classifier.ts` to track different legislative areas.

---

## Project Structure

```
legistrack/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # App header + data source status
│   │   ├── StatsBar.tsx        # Category summary cards
│   │   ├── FilterBar.tsx       # Search, sort, filter chips
│   │   ├── BillList.tsx        # Bill list container
│   │   ├── BillCard.tsx        # Individual bill card
│   │   ├── BillDetail.tsx      # Slide-over detail panel
│   │   └── LoadingState.tsx    # Skeleton loading UI
│   ├── services/
│   │   ├── congressApi.ts      # Congress.gov API integration
│   │   ├── legiscanApi.ts      # LegiScan API integration
│   │   ├── dataService.ts      # Unified fetch + merge layer
│   │   └── seedData.ts         # Fallback data (real bills)
│   ├── hooks/
│   │   └── useStore.ts         # Zustand state management
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   └── classifier.ts       # Bill relevance classifier
│   ├── styles/
│   │   └── index.css           # Tailwind + custom CSS
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Vite env types
├── .env.example                # Environment variable template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Customization

### Track Different Legislation

Edit `src/utils/classifier.ts` to modify:
- `SECTOR_KEYWORDS` — what keywords trigger each sector
- `SEARCH_QUERIES` in the API services — what terms to search for
- `HIGH_IMPACT_SIGNALS` — what makes a bill "Critical" or "High" impact

### Add More Data Sources

Create a new file in `src/services/` following the pattern of `congressApi.ts`:
1. Define your fetch function
2. Map results to the `Bill` type
3. Register it in `dataService.ts`'s `fetchAllBills()` function

### Deployment

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

The `dist/` folder can be deployed to any static host: Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.

**Important for deployment:** The Vite dev server proxies API calls to avoid CORS issues. In production, you'll need one of:
- A serverless function / edge function to proxy API calls (recommended)
- A backend server that handles API calls
- CORS-friendly API endpoints (Congress.gov supports CORS natively)

---

## Tech Stack

- **React 18** + TypeScript
- **Vite 6** — build tooling
- **Tailwind CSS 3** — styling
- **Zustand** — state management
- **date-fns** — date formatting
- **lucide-react** — icons

---

## License

MIT
