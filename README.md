
# ProVideo Platform - Professional Video Hub

A high-performance, SEO-first video platform leveraging Cloudflare Pages and Functions.

## 🚀 Cloudflare Deployment

### 1. Database Setup
Create your D1 database and initialize it.
```bash
npx wrangler d1 create provideo_db
npx wrangler d1 execute provideo_db --file=./schema.sql
```

### 2. Bind the Database
In your Cloudflare Pages project settings:
1. Go to **Settings** > **Functions**.
2. Add a **D1 database binding**.
3. **Variable name**: `DB`
4. **Database**: `provideo_db`

### 3. Folder Structure
The API logic now lives in the `/functions` directory:
- `/functions/api/v1/videos.ts` -> Listings
- `/functions/api/v1/video/[slug].ts` -> Details
- `/functions/api/v1/search.ts` -> Instant Search

### 4. SPA Redirects
Add a `_redirects` file to the root of your project:
```text
/*  /index.html  200
```

## Compliance
Strictly 18+. All content creators must be verified through the platform's compliance system.
