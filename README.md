# Avina's Research

A lightweight company research web application for exploring, tagging, saving, and comparing companies. Client-side SPA — no backend required.

---

## Running Locally

```bash
cd avinas-research
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router DOM v6 |
| State & Persistence | Zustand with `persist` middleware (localStorage) |
| Search | Fuse.js (client-side fuzzy search) |
| Icons | Lucide React |

### Data Layer

All company data lives in `src/data/companies.ts`. It exports a typed `COMPANIES` array and three helpers:

```ts
getCompanyById(id: string)       // look up one company
getRelatedCompanies(company)     // returns competitor companies
getCompaniesByIndustry(industry) // filter by industry
```

### Swapping in a Real API

The data layer is a clean abstraction. To replace static mock data with a live API:

1. Keep `src/data/types.ts` unchanged — the `Company` type is your contract
2. Replace `src/data/companies.ts` with an async data-fetching module
3. Add a `useCompanies()` hook (e.g. TanStack Query) that fetches from your API
4. Update each page to use `useCompanies()` instead of the direct `COMPANIES` import
5. For search, replace Fuse.js with an API call to your search endpoint (Meilisearch, Postgres FTS, Elasticsearch)

The state store (`src/store/useStore.ts`) requires **no changes** — it only stores user preferences and user-generated content (tags, notes, collections, favorites).

---

## Features

### Must Have (all implemented)
- **Global search** with typeahead autocomplete (Fuse.js, ⌘K shortcut)
- **Company profiles** — overview, financials, business model, competitors, recent developments, key people
- **Tagging** — create, apply, rename, delete tags per company; tag autocomplete on company page
- **Collections** — named folders; add/remove companies; create/rename/delete
- **Favorites** — star any company; sidebar access
- **Novice/Advanced mode** — toggle changes data density: Novice shows plain-language "2-minute" summaries; Advanced shows full financials and segment detail

### Should Have (all implemented)
- **Compare** — select 2–4 companies; side-by-side metric table; persistent compare bar across all pages
- **Notes** — freeform per-company notes with timestamps; inline editing on profile page
- **Recently Viewed** — automatic history of last 20 companies visited

### Additional
- **Screener** — multi-criteria filter builder (industry, type, revenue, growth, market cap, employees, founded year)
- **Dark mode** — toggle from header or Settings page
- **Directory** — grid and list view with inline filtering by industry, type, size
- **Keyboard shortcut** — ⌘K / Ctrl+K to focus global search from anywhere

---

## Seed Data

25 companies across 10 industries:

| Industry | Companies |
|---|---|
| Real Estate | CBRE, Oxford Properties, JLL, Prologis, Cushman & Wakefield |
| Retail & Consumer | lululemon, Nike, Amazon, Costco |
| Enterprise Software | Salesforce, ServiceNow, Snowflake, HubSpot, Workday |
| Financial Services | BlackRock, Stripe, Visa |
| Healthcare & Pharma | Eli Lilly, UnitedHealth Group |
| Technology | Microsoft, NVIDIA, Alphabet (Google) |
| Energy & Utilities | NextEra Energy, Tesla |
| Manufacturing & Industrial | Caterpillar, Honeywell |
| Media & Entertainment | Netflix, Spotify |
| Consulting & Professional Services | McKinsey, Accenture, Deloitte |

CBRE, Oxford Properties, and lululemon have enriched data drawn from internal research reports.

---

## Scaling to Production

| Concern | Recommendation |
|---|---|
| **Database** | PostgreSQL for user data; Meilisearch or Postgres FTS for company search |
| **Authentication** | NextAuth.js (email/password + Google OAuth) |
| **Backend** | Next.js API routes or FastAPI; stateless for horizontal scaling |
| **Company data** | Financial Modeling Prep, Crunchbase, or Alpha Vantage API |
| **Deployment** | Vercel (frontend + API routes) or AWS ECS |
| **Search at scale** | Meilisearch for sub-200ms search at 1M+ records |
| **Caching** | Redis for API response caching; add "last updated" timestamps |

The Zustand store structure maps cleanly to a relational schema: `users`, `collections`, `collection_companies`, `tags`, `company_tags`, `notes`.
