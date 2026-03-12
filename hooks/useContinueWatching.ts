'use client';

import { useLocalStorage } from './useLocalStorage';
import { ContinueItem } from '@/types';
import { useCallback } from 'react';

export function useContinueWatching() {
  const [continueWatching, setContinueWatching] = useLocalStorage<ContinueItem[]>('continue', []);

  const updateProgress = useCallback((item: ContinueItem) => {
    setContinueWatching(prev => {
      const filtered = prev.filter(c => !(c.id === item.id && c.type === item.type));
      return [item, ...filtered].slice(0, 20);
    });
  }, [setContinueWatching]);

  const removeFromContinue = useCallback((id: number, type: string) => {
    setContinueWatching(prev => prev.filter(c => !(c.id === id && c.type === type)));
  }, [setContinueWatching]);

  const getProgress = useCallback((id: number, type: string) => {
    return continueWatching.find(c => c.id === id && c.type === type);
  }, [continueWatching]);

  return { continueWatching, updateProgress, removeFromContinue, getProgress };
}
