
// When deploying to Netlify while the database is on Cloudflare, 
// set NEXT_PUBLIC_API_URL to your Cloudflare Pages URL (e.g., https://freeof-platform.pages.dev)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(path: string) {
  let baseUrl = API_BASE_URL;
  
  // If we have a base URL but it doesn't start with http, prepend https://
  if (baseUrl && !baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }

  const url = `${baseUrl}${path}`;
  console.log(`Fetching from API: ${url}`);
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      console.error(`API fetch failed for ${url}: ${res.status} ${res.statusText}`);
      throw new Error(`API fetch failed: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error(`Network error fetching from API ${url}:`, error);
    throw error;
  }
}
