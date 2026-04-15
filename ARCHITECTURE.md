# Architecture Decision Record (ADR) - Product Intelligence Platform

## Project Structure & Rationale
The project follows a **Next.js 14 App Router** architecture with a clear separation of concerns:
- **`src/app`**: Contains route-specific logic and server components. Used for initial data fetching (SSG/SSR) to ensure fast First Contentful Paint.
- **`src/components/ui`**: Atomic Shadcn/UI components for design consistency.
- **`src/components/dashboard`**: Composite client components for interactivity (filters, charts, chat).
- **`src/lib`**: Centralized logic for Supabase (Auth/DB) and OpenAI.

**Decision**: I opted for a **Hybrid Data Fetching** approach. Product lists are fetched in Server Components for SEO and speed, while detailed history and AI queries use Client Components/API routes for a responsive, modern SPA feel.

## Multi-Tenant Scaling (1,000+ Tenants)
If this were a production SaaS with 1,000+ tenants, I would change the **Database Multi-tenancy Strategy**.
- **Current**: Single public schema with simple RLS.
- **Production**: I would implement **Schema-level Isolation** or **Logical Isolation with strict tenant_id foreign keys** in every table. Most importantly, I would migrate to **Supabase Custom Claims** to store `tenant_id` in the JWT, ensuring RLS policies are tamper-proof and performant at scale.

## Performance Bottleneck (10,000 Queries/Day)
At 10,000 AI queries per day, the **Context Injection Mechanism** would break first.
- **Current**: Fetching the entire product catalog and injecting it into the LLM prompt. This would hit Context Window limits and cause massive latency/cost.
- **Breakdown**: 10,000 queries * volume of data = slow responses and $500+/day in OpenAI costs.
- **Fix**:
    1. **RAG (Retrieval Augmented Generation)**: Implement **pgvector** in Supabase. Generate embeddings for products and only inject the top 5-10 most relevant records based on semantic similarity.
    2. **Caching**: Implement a **Redis Cache (Upstash)** for common questions (e.g., "current price of matcha").
    3. **Rate Limiting**: Implement per-tenant and per-user quotas at the API Gateway level (e.g., Vercel Edge Config or Upstash Rate Limit).
