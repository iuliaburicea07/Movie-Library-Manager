'use client';

import { Movie, MediaType } from '@/types';
import Card from './Card';
import SkeletonCard from './SkeletonCard';

interface Props {
  title: string;
  items: Movie[];
  type: MediaType;
  loading?: boolean;
  onPlay?: (item: Movie, type: MediaType) => void;
  onStar?: (item: Movie, type: MediaType) => void;
  isStarred?: (id: number, type: string) => boolean;
  getProgress?: (id: number, type: string) => number | undefined;
  seeAllHref?: string;
  onBlacklist?: (item: Movie, type: MediaType) => void;
  isBlacklisted?: (id: number, type: string) => boolean;
}

export default function CardRow({ title, items, type, loading, onPlay, onStar, isStarred, getProgress, seeAllHref, onBlacklist, isBlacklisted }: Props) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {seeAllHref && <a href={seeAllHref} className="see-all">See all →</a>}
      </div>
      <div className="card-row">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(item => (
              <Card
                key={item.id}
                item={item}
                type={type}
                onPlay={onPlay}
                onStar={onStar}
                isStarred={isStarred?.(item.id, type)}
                progress={getProgress?.(item.id, type)}
                onBlacklist={onBlacklist}
                isBlacklisted={isBlacklisted?.(item.id, type)}
              />
            ))
        }
      </div>
    </section>
  );
}
