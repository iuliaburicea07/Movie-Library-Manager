'use client';

import { Movie } from '@/types';
import { imgUrl, getTitle, formatRating } from '@/lib/utils';
import { useRatings } from '@/hooks/useRatings';

interface Props {
  item: Movie;
  type: 'movie' | 'tv';
  onPlay?: (item: Movie, type: 'movie' | 'tv') => void;
  onStar?: (item: Movie, type: 'movie' | 'tv') => void;
  isStarred?: boolean;
  progress?: number;
  grid?: boolean;
  onBlacklist?: (item: Movie, type: 'movie' | 'tv') => void;
  isBlacklisted?: boolean;
}

export default function Card({ item, type, onPlay, onStar, isStarred, progress, grid, onBlacklist, isBlacklisted }: Props) {
  const title = getTitle(item);
  const { getRating } = useRatings();
  const userRating = getRating(item.id, item.media_type ?? type);

  return (
    <div
      className="card"
      style={grid ? { width: 'auto' } : undefined}
      onClick={() => onPlay?.(item, type)}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      onKeyDown={e => e.key === 'Enter' && onPlay?.(item, type)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="card-poster"
        src={imgUrl(item.poster_path)}
        alt={title}
        loading="lazy"
      />
      <div className="card-info">
        <div className="card-title">{title}</div>
        <div className="card-meta">
          {item.vote_average > 0 && (
            <span className="card-rating">★ {formatRating(item.vote_average)}</span>
          )}
        </div>
      </div>
      {progress !== undefined && progress > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
      {onStar && (
        <button
          className={`card-star-btn${isStarred ? ' starred' : ''}`}
          onClick={e => { e.stopPropagation(); onStar(item, type); }}
          aria-label={isStarred ? 'Remove from watch list' : 'Add to watch list'}
          type="button"
        >
          {isStarred ? '★' : '☆'}
        </button>
      )}
      {onBlacklist && (
        <button
          className={`card-blacklist-btn${isBlacklisted ? ' blacklisted' : ''}`}
          onClick={e => { e.stopPropagation(); onBlacklist(item, type); }}
          aria-label={isBlacklisted ? 'Remove from blacklist' : 'Blacklist'}
          type="button"
        >
          &#x2715;
        </button>
      )}
      {userRating > 0 && (
        <div className="card-user-rating">{userRating}/10</div>
      )}
    </div>
  );
}
