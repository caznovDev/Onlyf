# FreeOF Platform API Documentation

This guide provides the necessary information to connect to the FreeOF Platform API from an external frontend or application.

## Base URL
All API requests should be made to:
`https://ais-pre-hal4ejwgx4jqkk3c4lj2ef-175331373501.europe-west2.run.app/api/v1`

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
- **Method:** `GET`
- **Query Parameters:**
  - `page` (optional): Default `1`
  - `limit` (optional): Default `18`
- **Example Request:**
  `GET /api/v1/models?page=1`

### 5. Get Model Details & Videos
Fetch profile data for a specific model and their associated videos.

- **URL:** `/model/[slug]`
- **Method:** `GET`
- **Example Request:**
  `GET /api/v1/model/sophia-rose`

### 6. Get Tags (Listing)
Fetch all available video categories/tags.

- **URL:** `/tags`
- **Method:** `GET`

### 7. Get Tag Details & Videos
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

## Notes
- **View Counts:** Calling the `/video/[slug]` endpoint automatically increments the view counter in the database.
- **Cache:** Details are cached for 1 hour (`max-age=3600`).
