'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import GenreBar from '@/components/GenreBar';
import CardRow from '@/components/CardRow';
import Modal from '@/components/Modal';
import { Movie, MediaType } from '@/types';
import { fetchDiscover } from '@/lib/tmdb';
import { MOVIE_GENRES, TV_GENRES } from '@/lib/constants';
import { useWatched } from '@/hooks/useWatched';
import { useBlacklist } from '@/hooks/useBlacklist';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { usePageCache } from '@/context/pageState';

interface Results { results: Movie[] }

export default function HomePage() {
  const cache = usePageCache();
  const [type, setType] = useState<MediaType>(() => cache.current.home?.type ?? 'movie');
  const [genre, setGenre] = useState(() => cache.current.home?.genre ?? 0);
  const [trending, setTrending] = useState<Movie[]>(() => cache.current.home?.trending ?? []);
  const [topRated, setTopRated] = useState<Movie[]>(() => cache.current.home?.topRated ?? []);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ item: Movie; type: MediaType } | null>(null);
  const { isWatched, toggleWatched } = useWatched();
  const { isBlacklisted, toggleBlacklist } = useBlacklist();
  const { continueWatching, getProgress, removeFromContinue } = useContinueWatching();

  const hasCached = trending.length > 0 || topRated.length > 0;
  const stateRef = useRef({ type, genre, trending, topRated, scrollY: 0 });
  stateRef.current = { type, genre, trending, topRated, scrollY: stateRef.current.scrollY };
  const restoredRef = useRef(false);
  const skipFetchRef = useRef(hasCached);

  const genres = type === 'movie' ? MOVIE_GENRES : TV_GENRES;

  
  useEffect(() => {
    const onScroll = () => { stateRef.current.scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cache.current.home = { ...stateRef.current };
    };
  }, [cache]);

  
  useEffect(() => {
    if (hasCached && !restoredRef.current && cache.current.home?.scrollY) {
      restoredRef.current = true;
      const y = cache.current.home.scrollY;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [hasCached, cache]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base: Record<string, string> = { without_origin_country: 'IN' };
      if (genre) base.with_genres = String(genre);
      const [t, tr] = await Promise.all([
        fetchDiscover(type, { ...base, sort_by: 'popularity.desc', with_origin_country: 'US' }) as Promise<Results>,
        fetchDiscover(type, { ...base, sort_by: 'vote_average.desc', 'vote_count.gte': '300' }) as Promise<Results>,
      ]);
      setTrending(t.results || []);
      setTopRated(tr.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [type, genre]);

  useEffect(() => {
    if (skipFetchRef.current) { skipFetchRef.current = false; setLoading(false); return; }
    load();
  }, [load]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStar = useCallback((item: Movie, t: MediaType) => {
    toggleWatched({ id: item.id, type: t, title: item.title || item.name || '', poster: item.poster_path, watchedAt: Date.now() });
  }, [toggleWatched]);

  const handleBlacklist = useCallback((item: Movie, t: MediaType) => {
    toggleBlacklist({ id: item.id, type: t, title: item.title || item.name || '', poster: item.poster_path, blacklistedAt: Date.now() });
  }, [toggleBlacklist]);

  return (
    <>
      <Header />
      <main className="main">
        <Hero items={trending.slice(0, 5)} type={type} onPlay={(item) => setSelected({ item, type })} />

        <div style={{ padding: '12px 24px', display: 'flex', gap: 12 }}>
          <div className="type-toggle">
            <button className={`type-btn${type === 'movie' ? ' active' : ''}`} onClick={() => { setType('movie'); setGenre(0); }} type="button">Movies</button>
            <button className={`type-btn${type === 'tv' ? ' active' : ''}`} onClick={() => { setType('tv'); setGenre(0); }} type="button">TV Shows</button>
          </div>
        </div>

        <GenreBar genres={genres} active={genre} onChange={g => setGenre(g)} />

        {continueWatching.length > 0 && (() => {
          const continueMovies = continueWatching.map(c => ({
            id: c.id,
            title: c.title,
            poster_path: c.poster,
            backdrop_path: null,
            overview: '',
            vote_average: 0,
            media_type: c.type,
          } as Movie));
          return (
            <CardRow
              title="Continue Watching"
              items={continueMovies}
              type={type}
              onPlay={(item) => setSelected({ item, type: (item.media_type as MediaType) || type })}
              onStar={handleStar}
              isStarred={(id, t) => isWatched(id, t)}
              getProgress={(id, t) => getProgress(id, t)?.progress}
              onBlacklist={(item) => {
                const c = continueWatching.find(x => x.id === item.id);
                if (c) removeFromContinue(c.id, c.type);
              }}
              isBlacklisted={() => true}
            />
          );
        })()}

        <CardRow
          title="Trending"
          items={trending.filter(m => !isBlacklisted(m.id, type))}
          type={type}
          loading={loading}
          onPlay={(item) => setSelected({ item, type })}
          onStar={handleStar}
          isStarred={(id, t) => isWatched(id, t)}
          onBlacklist={handleBlacklist}
          isBlacklisted={(id, t) => isBlacklisted(id, t)}
          seeAllHref={`/browse?type=${type}&sort=popularity.desc`}
        />

        <CardRow
          title="Top Rated"
          items={topRated.filter(m => !isBlacklisted(m.id, type))}
          type={type}
          loading={loading}
          onPlay={(item) => setSelected({ item, type })}
          onStar={handleStar}
          isStarred={(id, t) => isWatched(id, t)}
          onBlacklist={handleBlacklist}
          isBlacklisted={(id, t) => isBlacklisted(id, t)}
          seeAllHref={`/browse?type=${type}&sort=vote_average.desc`}
        />
      </main>

      {selected && (
        <Modal item={selected.item} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
