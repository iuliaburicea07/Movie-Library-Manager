'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CardGrid from '@/components/CardGrid';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Movie, MediaType } from '@/types';
import { useWatchedHistory } from '@/hooks/useWatchedHistory';

export default function WatchedHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selected, setSelected] = useState<{ item: Movie; type: MediaType } | null>(null);
  const { history, toggleHistory } = useWatchedHistory();

  const filtered = history.filter(w => filter === 'all' || w.type === filter);
  const asMovies = filtered.map(w => ({
    id: w.id,
    title: w.title,
    poster_path: w.poster,
    backdrop_path: null,
    overview: '',
    vote_average: 0,
    media_type: w.type,
  } as Movie));

  return (
    <>
      <Header />
      <main className="main" style={{ paddingTop: 'var(--header-h)' }}>
        <div className="watched-header">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>Watched</h1>
          <div className="filter-pills">
            {(['all', 'movie', 'tv'] as const).map(f => (
              <button
                key={f}
                className={`genre-pill${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
                type="button"
              >
                {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Nothing watched yet"
            text="Mark movies and shows as watched to see them here"
          />
        ) : (
          <div className="section">
            <CardGrid
              items={asMovies}
              type={filter === 'tv' ? 'tv' : 'movie'}
              onPlay={(item) => {
                const w = history.find(x => x.id === item.id);
                setSelected({ item, type: w?.type || 'movie' });
              }}
              onStar={(item) => {
                const w = history.find(x => x.id === item.id);
                if (w) toggleHistory(w);
              }}
              isStarred={() => true}
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
