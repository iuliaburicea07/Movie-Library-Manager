const API_BASE = '/api/tmdb';

async function apiFetch(endpoint: string, params: Record<string, string> = {}): Promise<unknown> {
  const qs = new URLSearchParams({ endpoint, ...params }).toString();
  const res = await fetch(`${API_BASE}?${qs}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function fetchTrending(type: string, page = 1) {
  return apiFetch(`/trending/${type}/week`, { page: String(page) });
}

export async function fetchDiscover(type: string, params: Record<string, string> = {}) {
  return apiFetch(`/discover/${type}`, params);
}

export async function fetchSearch(query: string, type: string, page = 1) {
  return apiFetch(`/search/${type}`, { query, page: String(page) });
}

export async function fetchDetails(type: string, id: number) {
  return apiFetch(`/${type}/${id}`);
}

export async function fetchTopRated(type: string, page = 1) {
  return apiFetch(`/${type}/top_rated`, { page: String(page) });
}

export async function fetchNowPlaying(page = 1) {
  return apiFetch('/movie/now_playing', { page: String(page) });
}

export async function fetchOnAir(page = 1) {
  return apiFetch('/tv/on_the_air', { page: String(page) });
}
