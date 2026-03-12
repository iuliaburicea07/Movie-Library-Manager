'use client';

import { createContext, useContext, useRef, ReactNode } from 'react';
import { Movie, MediaType, SortOption } from '@/types';

export interface HomeCache {
  type: MediaType;
  genre: number;
  trending: Movie[];
  topRated: Movie[];
  scrollY: number;
}

export interface BrowseCache {
  type: MediaType;
  genre: number;
  sort: SortOption;
  items: Movie[];
  page: number;
  totalPages: number;
  scrollY: number;
}

export interface SearchCache {
  query: string;
  type: MediaType;
  results: Movie[];
  scrollY: number;
}

interface PageCache {
  home?: HomeCache;
  browse?: BrowseCache;
  search?: SearchCache;
}

const PageCacheContext = createContext<React.MutableRefObject<PageCache> | null>(null);

export function PageStateProvider({ children }: { children: ReactNode }) {
  const cache = useRef<PageCache>({});
  return <PageCacheContext.Provider value={cache}>{children}</PageCacheContext.Provider>;
}

export function usePageCache() {
  const ctx = useContext(PageCacheContext);
  if (!ctx) throw new Error('usePageCache must be used within PageStateProvider');
  return ctx;
}
