
# ProVideo Platform - Professional Video Hub

A high-performance, SEO-first video content platform designed for professional creators and cinematic delivery.

## 🚀 Step-by-Step Deployment

### 1. Database Setup
Ensure you have the Wrangler CLI installed (`npm install -g wrangler`).
```bash
# Create the D1 database
npx wrangler d1 create provideo_db

# Initialize the schema
npx wrangler d1 execute provideo_db --file=./schema.sql
```

### 2. Configure Environment
Update `wrangler.toml` with the `database_id` provided by the command above.

### 3. Deploy API (Workers)
The API logic is located in `worker-api.ts`.
```bash
npx wrangler deploy worker-api.ts --name provideo-api
```

### 4. Deploy Frontend (Pages)
1. Push your code to a GitHub repository.
2. In the Cloudflare Dashboard, go to **Pages** > **Connect to Git**.
3. Select this repo. 
4. **Build Command**: Leave empty (for pure ESM).
5. **Output Directory**: `/` (root).
6. Add a `_redirects` file to the root for SPA support: `/* /index.html 200`.

## Key Features
- **SEO-First Routing**: Immutable slugs for Videos, Models, and Tags.
- **Instant Edge Search**: Low-latency retrieval via Cloudflare Workers.
- **Hover Previews**: 500ms delayed interaction.
- **D1 Integration**: Serverless SQL storage for content and views.

## Technical Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons.
- **Backend**: Cloudflare Workers, D1 SQL Database, KV Caching.
