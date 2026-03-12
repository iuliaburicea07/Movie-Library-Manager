'use client';

import { useEffect, useState, useCallback } from 'react';
import { Movie, MediaType } from '@/types';
import { imgUrl, getTitle, getYear, formatRating } from '@/lib/utils';
import { HERO_INTERVAL } from '@/lib/constants';

interface Props {
  items: Movie[];
  type: MediaType;
  onPlay: (item: Movie, type: MediaType) => void;
}

export default function Hero({ items, type, onPlay }: Props) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!items.length) return;
    const id = setInterval(next, HERO_INTERVAL);
    return () => clearInterval(id);
  }, [items.length, next]);

  if (!items.length) return null;

  const item = items[current];
  const title = getTitle(item);
  const year = getYear(item);

  return (
    <div className="hero">
      {items.slice(0, 5).map((slide, i) => (
        <div key={slide.id} className={`hero-slide${i === current ? ' active' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-bg"
            src={imgUrl(slide.backdrop_path, 'original')}
            alt=""
            aria-hidden="true"
          />
          <div className="hero-overlay" />
        </div>
      ))}
      <div className="hero-content">
        <span className="hero-badge">{type === 'movie' ? 'Movie' : 'TV Series'}</span>
        <h1 className="hero-title">{title}</h1>
        <div className="hero-meta">
          {year && <span>{year}</span>}
          {item.vote_average > 0 && <span className="rating">★ {formatRating(item.vote_average)}</span>}
        </div>
        {item.overview && <p className="hero-overview">{item.overview}</p>}
        <div className="hero-btns">
          <button className="btn btn-primary" onClick={() => onPlay(item, type)} type="button">
            ▶ Play
          </button>
          <button className="btn btn-secondary" onClick={() => onPlay(item, type)} type="button">
            ⓘ More Info
          </button>
        </div>
      </div>
      <div className="hero-dots">
        {items.slice(0, 5).map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
