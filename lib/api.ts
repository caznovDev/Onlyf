
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://freeonlyfans.qzz.io';

export async function apiFetch(path: string) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!res.ok) {
    throw new Error(`API fetch failed: ${res.statusText}`);
  }
  
  return res.json();
}
