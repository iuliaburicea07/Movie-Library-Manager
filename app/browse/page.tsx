'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import GenreBar from '@/components/GenreBar';
import CardGrid from '@/components/CardGrid';
import Modal from '@/components/Modal';
import { Movie, MediaType, SortOption } from '@/types';
import { fetchDiscover } from '@/lib/tmdb';
import { MOVIE_GENRES, TV_GENRES } from '@/lib/constants';
import { useWatched } from '@/hooks/useWatched';
import { useBlacklist } from '@/hooks/useBlacklist';
import { usePageCache } from '@/context/pageState';

interface Results { results: Movie[]; total_pages: number }

function getPagesToShow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function BrowsePageInner() {
  const cache = usePageCache();
  const searchParams = useSearchParams();
  const [type, setType] = useState<MediaType>(() => {
    const p = searchParams.get('type');
    if (p === 'movie' || p === 'tv') { cache.current.browse = undefined; return p; }
    return cache.current.browse?.type ?? 'movie';
  });
  const [genre, setGenre] = useState(() => cache.current.browse?.genre ?? 0);
  const [sort, setSort] = useState<SortOption>(() => {
    const p = searchParams.get('sort');
    if (p === 'popularity.desc' || p === 'vote_average.desc' || p === 'vote_count.desc') return p;
    return cache.current.browse?.sort ?? 'popularity.desc';
  });
  const [items, setItems] = useState<Movie[]>(() => cache.current.browse?.items ?? []);
  const [page, setPage] = useState(() => cache.current.browse?.page ?? 1);
  const [totalPages, setTotalPages] = useState(() => cache.current.browse?.totalPages ?? 1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ item: Movie; type: MediaType } | null>(null);
  const { isWatched, toggleWatched } = useWatched();
  const { isBlacklisted, toggleBlacklist } = useBlacklist();

  const hasCached = items.length > 0;
  const stateRef = useRef({ type, genre, sort, items, page, totalPages, scrollY: 0 });
  stateRef.current = { type, genre, sort, items, page, totalPages, scrollY: stateRef.current.scrollY };
  const restoredRef = useRef(false);
  const skipFetchRef = useRef(hasCached);

  const genres = type === 'movie' ? MOVIE_GENRES : TV_GENRES;

  
  useEffect(() => {
    const onScroll = () => { stateRef.current.scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cache.current.browse = { ...stateRef.current };
    };
  }, [cache]);

  // Restore scroll once after cached data is ready
  useEffect(() => {
    if (hasCached && !restoredRef.current && cache.current.browse?.scrollY) {
      restoredRef.current = true;
      const y = cache.current.browse.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [hasCached, cache]);

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort_by: sort, without_origin_country: 'IN' };
      if (sort === 'vote_average.desc') params['vote_count.gte'] = '300';
      if (sort === 'popularity.desc') params['vote_count.gte'] = '200';
      if (genre) params.with_genres = String(genre);
      const p1 = 2 * pageNum - 1;
      const p2 = 2 * pageNum;
      const [d1, d2] = await Promise.all([
        fetchDiscover(type, { ...params, page: String(p1) }) as Promise<Results>,
        fetchDiscover(type, { ...params, page: String(p2) }) as Promise<Results>,
      ]);
      setItems([...(d1.results || []), ...(d2.results || [])]);
      setTotalPages(Math.ceil((d1.total_pages || 1) / 2));
      window.scrollTo({ top: 0 });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [type, genre, sort]);

  useEffect(() => {
    if (skipFetchRef.current) { skipFetchRef.current = false; setLoading(false); return; }
    setPage(1);
    load(1);
  }, [type, genre, sort, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPage = useCallback((p: number) => {
    setPage(p);
    load(p);
  }, [load]);

  const handleStar = useCallback((item: Movie, t: MediaType) => {
    toggleWatched({ id: item.id, type: t, title: item.title || item.name || '', poster: item.poster_path, watchedAt: Date.now() });
  }, [toggleWatched]);

  const handleBlacklist = useCallback((item: Movie, t: MediaType) => {
    toggleBlacklist({ id: item.id, type: t, title: item.title || item.name || '', poster: item.poster_path, blacklistedAt: Date.now() });
  }, [toggleBlacklist]);

  const pagesToShow = getPagesToShow(page, totalPages);

  return (
    <>
      <Header />
      <main className="main" style={{ paddingTop: 'var(--header-h)' }}>
        <div className="browse-controls">
          <div className="type-toggle">
            <button className={`type-btn${type === 'movie' ? ' active' : ''}`} onClick={() => { setType('movie'); setGenre(0); }} type="button">Movies</button>
            <button className={`type-btn${type === 'tv' ? ' active' : ''}`} onClick={() => { setType('tv'); setGenre(0); }} type="button">TV Shows</button>
          </div>
          <select
            className="select-sm"
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="vote_count.desc">Most Watched</option>
          </select>
        </div>

        <GenreBar genres={genres} active={genre} onChange={g => setGenre(g)} />

        <div className="section">
          <CardGrid
            items={items.filter(m => !isBlacklisted(m.id, type)).slice(0, 20)}
            type={type}
            loading={loading}
            onPlay={(item) => setSelected({ item, type })}
            onStar={handleStar}
            isStarred={(id, t) => isWatched(id, t)}
            onBlacklist={handleBlacklist}
            isBlacklisted={(id, t) => isBlacklisted(id, t)}
          />
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              type="button"
            >
              ‹
            </button>
            {pagesToShow.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`page-btn${p === page ? ' active' : ''}`}
                  onClick={() => { if (p !== page) goToPage(p as number); }}
                  type="button"
                >
                  {p}
                </button>
              )
            )}
            <button
              className="page-btn"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              type="button"
            >
              ›
            </button>
          </div>
        )}
      </main>

      {selected && (
        <Modal item={selected.item} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default function BrowsePage() {
  return <Suspense><BrowsePageInner /></Suspense>;
}
