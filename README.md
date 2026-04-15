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
sk-abcdef1234567890abcdef1234567890abcdef12
sk-1234567890abcdef1234567890abcdef12345678
sk-abcdefabcdefabcdefabcdefabcdefabcdef12
sk-7890abcdef7890abcdef7890abcdef7890abcd
sk-1234abcd1234abcd1234abcd1234abcd1234abcd
sk-abcd1234abcd1234abcd1234abcd1234abcd1234
sk-5678efgh5678efgh5678efgh5678efgh5678efgh
sk-efgh5678efgh5678efgh5678efgh5678efgh5678
sk-ijkl1234ijkl1234ijkl1234ijkl1234ijkl1234
sk-mnop5678mnop5678mnop5678mnop5678mnop5678
sk-qrst1234qrst1234qrst1234qrst1234qrst1234
sk-uvwx5678uvwx5678uvwx5678uvwx5678uvwx5678
sk-1234ijkl1234ijkl1234ijkl1234ijkl1234ijkl
sk-5678mnop5678mnop5678mnop5678mnop5678mnop
sk-qrst5678qrst5678qrst5678qrst5678qrst5678
sk-uvwx1234uvwx1234uvwx1234uvwx1234uvwx1234
sk-1234abcd5678efgh1234abcd5678efgh1234abcd
sk-5678ijkl1234mnop5678ijkl1234mnop5678ijkl
sk-abcdqrstefghuvwxabcdqrstefghuvwxabcdqrst
sk-ijklmnop1234qrstijklmnop1234qrstijklmnop
sk-1234uvwx5678abcd1234uvwx5678abcd1234uvwx
sk-efghijkl5678mnopabcd1234efghijkl5678mnop
sk-mnopqrstuvwxabcdmnopqrstuvwxabcdmnopqrst
sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop
sk-abcd1234efgh5678abcd1234efgh5678abcd1234
sk-1234ijklmnop5678ijklmnop1234ijklmnop5678
sk-qrstefghuvwxabcdqrstefghuvwxabcdqrstefgh
sk-uvwxijklmnop1234uvwxijklmnop1234uvwxijkl
sk-abcd5678efgh1234abcd5678efgh1234abcd5678
sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop
sk-1234qrstuvwxabcd1234qrstuvwxabcd1234qrst
sk-efghijklmnop5678efghijklmnop5678efghijkl
sk-mnopabcd1234efghmnopabcd1234efghmnopabcd
sk-ijklqrst5678uvwxijklqrst5678uvwxijklqrst
sk-1234ijkl5678mnop1234ijkl5678mnop1234ijkl
sk-abcdqrstefgh5678abcdqrstefgh5678abcdqrst
sk-ijklmnopuvwx1234ijklmnopuvwx1234ijklmnop
sk-efgh5678abcd1234efgh5678abcd1234efgh5678
sk-mnopqrstijkl5678mnopqrstijkl5678mnopqrst
sk-1234uvwxabcd5678uvwxabcd1234uvwxabcd5678
sk-ijklmnop5678efghijklmnop5678efghijklmnop
sk-abcd1234qrstuvwxabcd1234qrstuvwxabcd1234
sk-1234efgh5678ijkl1234efgh5678ijkl1234efgh
sk-5678mnopqrstuvwx5678mnopqrstuvwx5678mnop
sk-abcdijkl1234uvwxabcdijkl1234uvwxabcdijkl
sk-ijklmnopabcd5678ijklmnopabcd5678ijklmnop
sk-1234efghqrstuvwx1234efghqrstuvwx1234efgh
sk-5678ijklmnopabcd5678ijklmnopabcd5678ijkl
sk-abcd1234efgh5678abcd1234efgh5678abcd1234
sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop