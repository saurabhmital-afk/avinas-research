# Avina's Research

A company research and comparison app designed for browsing company profiles, organizing research, saving notes, and comparing businesses across sectors.

This project is a strong example of an information-heavy workflow tool: it combines search, structured data, saved collections, and a product-style dashboard experience.

## Why this project matters

- Makes large company datasets easier to explore
- Enables quick side-by-side comparison of firms
- Helps users save and revisit research in an organized workflow
- Shows a full product-style interface for a knowledge-heavy use case

## Features

- Global search and quick filtering
- Company profiles with business, financial, and market context
- Favorites, notes, and recently viewed history
- Tagging and collection management
- Comparison mode for multiple companies
- Dark mode and responsive dashboard layout
- Novice and advanced views for different audiences

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Fuse.js
- React Router

## Run locally

```bash
cd avinas-research
npm install
npm run dev
```

Then open: http://localhost:5173

## Project structure

- `src/data/companies.ts` — seed company dataset
- `src/pages/` — landing, profile, compare, and dashboard pages
- `src/store/` — state management and persistence
- `src/components/` — reusable UI and product elements

## Demo use cases

This app is useful for:

- company research workflows
- early-stage market mapping
- competitor analysis
- internal product demos for analyst tools

## Notes

The data layer is intentionally structured so it can be replaced with a real API later without changing the broader product experience.

## Suggested resume line

`Product-focused research and comparison web app built with React, TypeScript, and Vite for structured company discovery and decision support.`
