'use client';

import { useLocalStorage } from './useLocalStorage';
import { WatchedItem } from '@/types';
import { useCallback } from 'react';

export function useWatched() {
  const [watched, setWatched] = useLocalStorage<WatchedItem[]>('watched', []);

  const addWatched = useCallback((item: WatchedItem) => {
    setWatched(prev => {
      const filtered = prev.filter(w => !(w.id === item.id && w.type === item.type));
      return [item, ...filtered];
    });
  }, [setWatched]);

  const removeWatched = useCallback((id: number, type: string) => {
    setWatched(prev => prev.filter(w => !(w.id === id && w.type === type)));
  }, [setWatched]);

  const isWatched = useCallback((id: number, type: string) => {
    return watched.some(w => w.id === id && w.type === type);
  }, [watched]);

  const toggleWatched = useCallback((item: WatchedItem) => {
    if (isWatched(item.id, item.type)) {
      removeWatched(item.id, item.type);
    } else {
      addWatched(item);
    }
  }, [isWatched, addWatched, removeWatched]);

  return { watched, addWatched, removeWatched, isWatched, toggleWatched };
}
