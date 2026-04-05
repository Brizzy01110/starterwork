# Amazon Work Order Management Dashboard

A production-grade work order management dashboard for an Amazon Fulfillment Center. Tracks machine issues, operational states, and maintenance activities across the facility floor.

## Quick Start

```bash
# Install Node.js 18+ from https://nodejs.org first, then:
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
# Output goes to /dist - deploy to any static host (Vercel, Netlify, S3, etc.)
npm run preview  # Preview the production build locally
```

## Deploy to Vercel (one command)

```bash
npm install -g vercel
vercel --prod
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- Lucide React (icons)
- Recharts (analytics charts)
- localStorage persistence

## Features

- Work order table with sort, filter, search, and bulk actions
- Machine state Kanban board
- Analytics charts (by type, priority, state, daily trend, tech workload)
- Create / update / close work orders
- Technician notes timeline
- CSV export
- Filter presets saved to localStorage
- Responsive - works on desktop and tablet/mobile
