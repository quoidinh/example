# Switch Supply - Product Intelligence Dashboard

A mini product intelligence dashboard with an AI query layer built for an Australian ingredient supplier.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS & Shadcn UI
- **AI**: OpenAI (gpt-4o-mini)
- **Charts**: Recharts

## Getting Started

### 1. Prerequisites
- Node.js 18+
- A Supabase project
- An OpenAI API Key

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

### 3. Database Setup
Run the SQL migration found in `supabase/migrations/20260411_initial_schema.sql` in your Supabase SQL Editor. This will:
- Create `products`, `price_history`, and `query_history` tables.
- Enable RLS policies for secure data access.
- Seed the database with 15 realistic ingredient records and 3 months of price history.

### 4. Installation
```bash
npm install
npm run dev
```

## Key Features
- **Authentication**: Secure login via Supabase Auth.
- **Product Dashboard**: Searchable and filterable table with real-time inventory tracking.
- **Visual Analytics**: Interactive price trend charts for every product.
- **AI Query Assistant**: Natural language interface to query stock levels, price trends, and supplier details with data-backed answers and confidence indicators.

## Architecture & Decisions
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of design decisions, scaling strategies, and performance considerations.