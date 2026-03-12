import { IMG_BASE } from './constants';

export function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function imgUrl(path: string | null, size = 'w500'): string {
  if (!path) return '/placeholder.png';
  return `${IMG_BASE}/${size}${path}`;
}

export function getTitle(item: { title?: string; name?: string }): string {
  return item.title || item.name || 'Unknown';
}

export function getYear(item: { release_date?: string; first_air_date?: string }): string {
  const date = item.release_date || item.first_air_date || '';
  return date ? date.slice(0, 4) : '';
}

export function formatRating(r: number): string {
  return r ? r.toFixed(1) : 'N/A';
}
