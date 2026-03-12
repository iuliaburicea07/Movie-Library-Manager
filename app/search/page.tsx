'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import CardGrid from '@/components/CardGrid';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Movie, MediaType } from '@/types';
import { fetchSearch } from '@/lib/tmdb';
import { useDebounce } from '@/hooks/useDebounce';
import { useWatched } from '@/hooks/useWatched';
import { useBlacklist } from '@/hooks/useBlacklist';
import { usePageCache } from '@/context/pageState';

interface Results { results: Movie[] }

export default function SearchPage() {
  const cache = usePageCache();
  const [query, setQuery] = useState(() => cache.current.search?.query ?? '');
  const [type, setType] = useState<MediaType>(() => cache.current.search?.type ?? 'movie');
  const [results, setResults] = useState<Movie[]>(() => cache.current.search?.results ?? []);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{ item: Movie; type: MediaType } | null>(null);
  const { isWatched, toggleWatched } = useWatched();
  const { isBlacklisted, toggleBlacklist } = useBlacklist();
  const debouncedQuery = useDebounce(query, 400);

  const hasCached = results.length > 0 || query !== '';
  const stateRef = useRef({ query, type, results, scrollY: 0 });
  stateRef.current = { query, type, results, scrollY: stateRef.current.scrollY };
  const restoredRef = useRef(false);
  const skipFetchRef = useRef(hasCached);

  
  useEffect(() => {
    const onScroll = () => { stateRef.current.scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cache.current.search = { ...stateRef.current };
    };
  }, [cache]);

  
  useEffect(() => {
    if (hasCached && !restoredRef.current && cache.current.search?.scrollY) {
      restoredRef.current = true;
      const y = cache.current.search.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [hasCached, cache]);

  useEffect(() => {
    if (skipFetchRef.current) { skipFetchRef.current = false; return; }
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    fetchSearch(debouncedQuery, type)
      .then(d => setResults((d as Results).results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery, type]);

  const handleStar = (item: Movie, t: MediaType) => {
    toggleWatched({ id: item.id, type: t, title: item.title || item.name || '', poster: item.poster_path, watchedAt: Date.now() });
  };

  const handleBlacklist = (item: Movie, t: MediaType) => {
    toggleBlacklist({ id: item.id, type: t, title: item.title || item.name || '', poster: item.poster_path, blacklistedAt: Date.now() });
  };

  return (
    <>
      <Header />
      <main className="main" style={{ paddingTop: 'var(--header-h)' }}>
        <div className="search-header">
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="type-toggle">
              <button className={`type-btn${type === 'movie' ? ' active' : ''}`} onClick={() => setType('movie')} type="button">Movies</button>
              <button className={`type-btn${type === 'tv' ? ' active' : ''}`} onClick={() => setType('tv')} type="button">TV Shows</button>
            </div>
          </div>
          <div className="search-input-wrap">
            <input
              className="search-input"
              type="search"
              placeholder="Search movies & TV shows..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {!query.trim() ? (
          <EmptyState title="Search for movies & TV shows" text="Type to search..." />
        ) : loading ? (
          <div className="section"><CardGrid items={[]} type={type} loading /></div>
        ) : results.length === 0 ? (
          <EmptyState title="No results found" text={`Nothing found for "${query}"`} />
        ) : (
          <div className="section">
            <CardGrid
              items={results.filter(m => !isBlacklisted(m.id, type))}
              type={type}
              onPlay={(item) => setSelected({ item, type })}
              onStar={handleStar}
              isStarred={(id, t) => isWatched(id, t)}
              onBlacklist={handleBlacklist}
              isBlacklisted={(id, t) => isBlacklisted(id, t)}
            />
          </div>
        )}
      </main>

      {selected && (
        <Modal item={selected.item} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
