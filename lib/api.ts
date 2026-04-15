export const API_BASE_URL = '';

export async function apiFetch(path: string) {
  const url = `${API_BASE_URL}${path}`;
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
