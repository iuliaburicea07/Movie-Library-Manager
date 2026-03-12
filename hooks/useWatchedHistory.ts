'use client';

import { useLocalStorage } from './useLocalStorage';
import { WatchedItem } from '@/types';
import { useCallback } from 'react';

export function useWatchedHistory() {
  const [history, setHistory] = useLocalStorage<WatchedItem[]>('watched_history', []);

  const addToHistory = useCallback((item: WatchedItem) => {
    setHistory(prev => {
      const filtered = prev.filter(w => !(w.id === item.id && w.type === item.type));
      return [item, ...filtered];
    });
  }, [setHistory]);

  const removeFromHistory = useCallback((id: number, type: string) => {
    setHistory(prev => prev.filter(w => !(w.id === id && w.type === type)));
  }, [setHistory]);

  const isInHistory = useCallback((id: number, type: string) => {
    return history.some(w => w.id === id && w.type === type);
  }, [history]);

  const toggleHistory = useCallback((item: WatchedItem) => {
    if (isInHistory(item.id, item.type)) {
      removeFromHistory(item.id, item.type);
    } else {
      addToHistory(item);
    }
  }, [isInHistory, addToHistory, removeFromHistory]);

  return { history, addToHistory, removeFromHistory, isInHistory, toggleHistory };
}
