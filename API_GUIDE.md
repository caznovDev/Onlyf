# FreeOF Platform API Documentation

This guide provides the necessary information to connect to the FreeOF Platform API from an external frontend or application.

## Base URL
Use the following base URL for your API requests:
`https://ais-pre-hal4ejwgx4jqkk3c4lj2ef-175331373501.europe-west2.run.app/api/v1`

---

## Security & Allowed Calls

All API routes are protected by a security gatekeeper and strict CORS policies. Only **allowed calls** receive data.

### Authorized Call Criteria
A request is allowed if it meets **at least one** of the following conditions:
1. **Valid API Key:** Passed via `x-api-key: <KEY>` or `Authorization: Bearer <KEY>`. Set via the `API_SECRET_KEY` environment variable.
2. **First-Party Platform Request:** Originates from the FreeOF web app (`freeonlyfans.qzz.io`, Cloud Run origin, or local development).
3. **Whitelisted External Origin:** Configured in the `ALLOWED_ORIGINS` environment variable.
4. **Admin Key (Required for Write Operations):** Mutating requests (`POST /api/v1/upload`, `POST /api/v1/models`, `PATCH /api/v1/models`) require the admin key or first-party session.

Calls that do not satisfy these conditions will be rejected with `401 Unauthorized` or `403 Forbidden`.

---

### Example Fetch (Authorized Pattern)
```javascript
const API_BASE = "https://freeonlyfans.qzz.io/api/v1";
const API_KEY = "YOUR_API_KEY"; // Configured in API_SECRET_KEY

async function fetchVideos(page = 1) {
  try {
    const response = await fetch(`${API_BASE}/videos?page=${page}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "x-api-key": API_KEY
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}
```

---

## Endpoints

### 1. Get Videos (Listings)
Fetch a paginated list of published videos.

- **URL:** `/videos`
- **Method:** `GET`
- **Query Parameters:**
  - `page` (optional): The page number (default: `1`)
  - `limit` (optional): Items per page (default: `8`)
- **Example Request:**
  `GET /api/v1/videos?page=1&limit=12`
- **Response Shape:**
  ```json
  {
    "videos": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 120,
      "totalPages": 10
    }
  }
  ```

### 2. Get Video Details
Fetch full details for a specific video by its slug. **Note:** Accessing this endpoint increments the view count.

- **URL:** `/video/[slug]`
- **Method:** `GET`
- **Example Request:**
  `GET /api/v1/video/exclusive-beach-shoot-v01`
- **Response Shape:**
  ```json
  {
    "id": "uuid",
    "title": "Exclusive Beach Shoot",
    "slug": "exclusive-beach-shoot-v01",
    "description": "...",
    "views": 105,
    "thumbnail": "...",
    "hover_preview_url": "...",
    "model_name": "...",
    "model_slug": "..."
  }
  ```

### 3. Instant Search
Search for videos and models.

- **URL:** `/search`
- **Method:** `GET`
- **Query Parameters:**
  - `q`: The search query (minimum 2 characters)
- **Example Request:**
  `GET /api/v1/search?q=beach`
- **Response Shape:**
  ```json
  {
    "videos": [...],
    "models": [...]
  }
  ```

### 4. Get Models (Listing)
Fetch a paginated list of all creators/models.

- **URL:** `/models`
- **Method:** `GET` or `POST`
- **GET Query Parameters:**
  - `page` (optional): Default `1`
  - `limit` (optional): Default `18`
- **POST JSON Payload (Create Model):**
  - `name`: String (required)
  - `slug`: String (required, unique)
  - `bio` (optional): String
  - `thumbnail` (optional): String
- **Example Request:**
  `GET /api/v1/models?page=1`

### 5. Check if Model Exists
Check if a model exists by slug.

- **URL:** `/models/check`
- **Method:** `GET`
- **Query Parameters:**
  - `slug`: The model slug to check
- **Example Request:**
  `GET /api/v1/models/check?slug=sophia-rose`
- **Response Shape:**
  ```json
  {
    "exists": true,
    "id": "model-uuid",
    "model": { ... }
  }
  ```

### 6. Upload/Sync Video
Upload or synchronize a new video. Automatically registers tags and updates creator statistics.

- **URL:** `/upload`
- **Method:** `POST`
- **POST JSON Payload:**
  - `title`: String (required)
  - `description` (optional): String
  - `modelId`: String (required - can be model UUID or slug)
  - `video_url`: String (required)
  - `thumbnail_url`: String (required - site poster thumbnail)
  - `twitter_thumbnail_url` (optional): String (Twitter card meta tag thumbnail, e.g. 16:9 collage or custom preview. Defaults to `thumbnail_url` if omitted)
  - `duration` (optional): Integer
  - `resolution` (optional): String (e.g. "1080p", "4K")
  - `orientation` (optional): String ("landscape" or "portrait")
  - `type` (optional): String (default: "normal")
  - `tags` (optional): Array of strings
- **Example Request:**
  `POST /api/v1/upload`

### 7. Get Model Details & Videos
Fetch profile data for a specific model and their associated videos.

- **URL:** `/model/[slug]`
- **Method:** `GET`
- **Example Request:**
  `GET /api/v1/model/sophia-rose`

### 8. Get Tags (Listing)
Fetch all available video categories/tags.

- **URL:** `/tags`
- **Method:** `GET`

### 9. Get Tag Details & Videos
Fetch videos associated with a specific tag (e.g., #exclusive, #4k).

- **URL:** `/tag/[slug]`
- **Method:** `GET`
- **Example Request:**
  `GET /api/v1/tag/exclusive`

---

## Headers
- **Content-Type:** `application/json`
- **Accept:** `application/json`

## CORS
CORS is explicitly enabled for **all origins**. You can connect to this API from any frontend (local or production) without receiving "Cross-Origin Request Blocked" errors. The API handles `OPTIONS` preflight requests automatically.

### Example Fetch (Javascript/Frontend)
If you are experiencing a "fetch error" from Netlify or other platforms, ensure you are not sending credentials with `*` origin, and use a standard fetch block:

```javascript
const apiUrl = "https://ais-pre-hal4ejwgx4jqkk3c4lj2ef-175331373501.europe-west2.run.app/api/v1";

try {
  const response = await fetch(`${apiUrl}/videos?page=1`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
    // Important for origins with '*':
    credentials: "omit" 
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error("Fetch failed:", error);
}
```

## Notes
- **View Counts:** Calling the `/video/[slug]` endpoint automatically increments the view counter in the database.
- **Cache:** Details are cached for 1 hour (`max-age=3600`).
