'use client';

import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';

export function useRatings() {
  const [ratings, setRatings] = useLocalStorage<Record<string, number>>('ratings', {});

  const setRating = useCallback((id: number, type: string, rating: number) => {
    setRatings(prev => ({ ...prev, [`${type}_${id}`]: rating }));
  }, [setRatings]);

  const getRating = useCallback((id: number, type: string) => {
    return ratings[`${type}_${id}`] || 0;
  }, [ratings]);

  const removeRating = useCallback((id: number, type: string) => {
    setRatings(prev => {
      const next = { ...prev };
      delete next[`${type}_${id}`];
      return next;
    });
  }, [setRatings]);

  return { ratings, setRating, getRating, removeRating };
}
