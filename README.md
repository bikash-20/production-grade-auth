# Auth App

Minimal monorepo: Vite + React client and Node.js + Express API.

- Email/password and Google/GitHub OAuth via **Supabase Auth**
- Server validates the Supabase access token with `supabase.auth.getUser`
- No service_role key anywhere — only the anon key is used

```
auth-app/
├── client/   # Vite + React SPA
└── server/   # Express API
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Settings → API** — copy the Project URL and the `anon` public key.
3. **Authentication → Providers** — enable Email/Password (on), Google, and GitHub. For OAuth providers, supply the client IDs/secrets and set the redirect URL to:
   ```
   https://<your-project>.supabase.co/auth/v1/callback
   ```

## 2. Local development

Two terminals.

```bash
# terminal 1 — server
cd server
cp .env.example .env       # fill in SUPABASE_URL, SUPABASE_ANON_KEY, CLIENT_URL
npm install
npm run dev                # http://localhost:3001

# terminal 2 — client
cd client
cp .env.example .env       # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev                # http://localhost:5173
```

Smoke tests:

```bash
curl http://localhost:3001/health
# {"ok":true}

curl http://localhost:3001/api/me
# {"error":"Unauthorized"}

curl -H "Authorization: Bearer <supabase-access-token>" http://localhost:3001/api/me
# {"id":"...","email":"..."}
```

## 3. Deploy

Deploy the server first so you know its URL when you set `VITE_API_URL` on the client.

### Server → Render

1. New → **Web Service** from this repo.
2. **Root directory**: `server`
3. **Build command**: `npm install`
4. **Start command**: `node index.js`
5. **Environment variables**:
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_ANON_KEY` — anon key
   - `CLIENT_URL` — leave blank on first deploy; update to your Vercel URL after the client deploys, then redeploy.
6. Note the Render URL (e.g. `https://auth-app-server.onrender.com`).

### Client → Vercel

1. New **Project** from this repo.
2. **Root directory**: `client`
3. Framework preset: **Vite** (auto-detected).
4. **Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` — the Render URL from above
5. Deploy. `vercel.json` handles the SPA rewrite to `index.html`.
6. After the client is live, go back to Render and set `CLIENT_URL` to the Vercel URL, then redeploy the server so CORS matches.

## Security notes

- Only the Supabase **anon** key is used. The **service_role** key must never appear in this repo, in env files, or in client code.
- The server treats the access token as untrusted input and re-validates it with Supabase on every request.
- `.env`, `node_modules`, `dist`, and `.vercel` are git-ignored.