

import { useEffect, useRef, useState, useCallback } from 'react';
import { Movie, MediaType, TVDetails } from '@/types';
import { getTitle, getYear, formatRating } from '@/lib/utils';
import { fetchDetails } from '@/lib/tmdb';
import RatingWidget from './RatingWidget';
import { useRatings } from '@/hooks/useRatings';
import { useWatched } from '@/hooks/useWatched';
import { useWatchedHistory } from '@/hooks/useWatchedHistory';
import { useContinueWatching } from '@/hooks/useContinueWatching';
const ASSUMED_DURATION_S = 90 * 60;
const PROGRESS_SAVE_INTERVAL_MS = 5000;
const SECONDS_PER_TICK = PROGRESS_SAVE_INTERVAL_MS / 1000;

interface Props {
  item: Movie;
  type: MediaType;
  onClose: () => void;
}

export default function Modal({ item, type, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [tvDetails, setTvDetails] = useState<TVDetails | null>(null);
  const { getRating, setRating, removeRating } = useRatings();
  const { toggleWatched, isWatched } = useWatched();
  const { isInHistory, toggleHistory } = useWatchedHistory();
  const { updateProgress, getProgress } = useContinueWatching();
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const progressRef = useRef(0);

  const title = getTitle(item);
  const year = getYear(item);
  const watched = isWatched(item.id, type);
  const inHistory = isInHistory(item.id, type);
  const rating = getRating(item.id, type);

  
  useEffect(() => {
    const prog = getProgress(item.id, type);
    if (prog) {
      progressRef.current = prog.progress;
    }
  }, [item.id, type, getProgress]);

  
  useEffect(() => {
    if (type !== 'tv') return;
    fetchDetails('tv', item.id).then(d => setTvDetails(d as TVDetails)).catch(() => {});
  }, [item.id, type]);

  
  useEffect(() => {
    timerRef.current = setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + (100 / ASSUMED_DURATION_S) * SECONDS_PER_TICK);
      updateProgress({
        id: item.id,
        type,
        title,
        poster: item.poster_path,
        progress: progressRef.current,
        updatedAt: Date.now(),
      });
    }, PROGRESS_SAVE_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [item.id, type, title, item.poster_path, updateProgress]);

  
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [onClose]);

  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);





  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal" ref={modalRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal" type="button">
          ✕
        </button>

        <div className="modal-banner" style={{ width: '100%', aspectRatio: '16/5', background: '#222', borderRadius: '12px 12px 0 0', overflow: 'hidden', marginBottom: 16 }}>
          {item.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <div className="modal-meta">
            {year && <span>{year}</span>}
            {item.vote_average > 0 && <span>★ {formatRating(item.vote_average)}</span>}
            <span style={{ textTransform: 'capitalize' }}>{type}</span>
          </div>
          {item.overview && <p className="modal-overview">{item.overview}</p>}

          <div className="modal-controls">
            <button
              className={`icon-btn${watched ? ' active' : ''}`}
              onClick={() => toggleWatched({
                id: item.id,
                type,
                title,
                poster: item.poster_path,
                watchedAt: Date.now(),
              })}
              type="button"
            >
              {watched ? '★' : '☆'}
            </button>
            <button
              className={`icon-btn${inHistory ? ' active' : ''}`}
              onClick={() => toggleHistory({
                id: item.id,
                type,
                title,
                poster: item.poster_path,
                watchedAt: Date.now(),
              })}
              type="button"
            >
              👁
            </button>
          </div>

          <div>
            <div style={{ marginBottom: 8, fontSize: 15, color: 'var(--text-dim)' }}>Your Rating</div>
            <RatingWidget
              value={rating}
              onChange={v => {
                if (v === rating) {
                  removeRating(item.id, type);
                } else {
                  setRating(item.id, type, v);
                  if (!inHistory) toggleHistory({ id: item.id, type, title, poster: item.poster_path, watchedAt: Date.now() });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
