# PodFlow frontend

Next.js, React, TypeScript, and Tailwind application shell managed with Bun.

```powershell
Copy-Item .env.example .env.local
bun install --frozen-lockfile
bun run dev
```

Run `bun run lint`, `bun run typecheck`, and `bun run build` before review.

Only `NEXT_PUBLIC_*` values are available to browser code. Do not put Supabase
service-role keys, database URLs, JWT-signing secrets, OAuth client secrets, or
model-provider keys in `.env.local`.
