'use client';

import { Movie, MediaType } from '@/types';
import Card from './Card';
import SkeletonCard from './SkeletonCard';

interface Props {
  items: Movie[];
  type: MediaType;
  loading?: boolean;
  onPlay?: (item: Movie, type: MediaType) => void;
  onStar?: (item: Movie, type: MediaType) => void;
  isStarred?: (id: number, type: string) => boolean;
  getProgress?: (id: number, type: string) => number | undefined;
  onBlacklist?: (item: Movie, type: MediaType) => void;
  isBlacklisted?: (id: number, type: string) => boolean;
}

export default function CardGrid({ items, type, loading, onPlay, onStar, isStarred, getProgress, onBlacklist, isBlacklisted }: Props) {
  return (
    <div className="card-grid">
      {loading
        ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} grid />)
        : items.map(item => (
            <Card
              key={item.id}
              item={item}
              type={type}
              grid
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
  );
}
