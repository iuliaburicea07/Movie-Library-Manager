'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CardGrid from '@/components/CardGrid';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { Movie, MediaType } from '@/types';
import { useBlacklist } from '@/hooks/useBlacklist';

export default function BlacklistedPage() {
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selected, setSelected] = useState<{ item: Movie; type: MediaType } | null>(null);
  const { blacklist, toggleBlacklist } = useBlacklist();

  const filtered = blacklist.filter(b => filter === 'all' || b.type === filter);
  const asMovies = filtered.map(b => ({
    id: b.id,
    title: b.title,
    poster_path: b.poster,
    backdrop_path: null,
    overview: '',
    vote_average: 0,
    media_type: b.type,
  } as Movie));

  return (
    <>
      <Header />
      <main className="main" style={{ paddingTop: 'var(--header-h)' }}>
        <div className="watched-header">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>Blacklisted</h1>
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
            title="No blacklisted items"
            text="Items you blacklist will appear here. You can restore them anytime."
          />
        ) : (
          <div className="section">
            <CardGrid
              items={asMovies}
              type={filter === 'tv' ? 'tv' : 'movie'}
              onPlay={(item) => {
                const b = blacklist.find(x => x.id === item.id);
                setSelected({ item, type: b?.type || 'movie' });
              }}
              onStar={(item) => {
                const b = blacklist.find(x => x.id === item.id);
                if (b) toggleBlacklist(b);
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
