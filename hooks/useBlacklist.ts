'use client';

import { useLocalStorage } from './useLocalStorage';
import { BlacklistItem } from '@/types';
import { useCallback } from 'react';

export function useBlacklist() {
  const [blacklist, setBlacklist] = useLocalStorage<BlacklistItem[]>('blacklist', []);

  const addBlacklist = useCallback((item: BlacklistItem) => {
    setBlacklist(prev => {
      const filtered = prev.filter(b => !(b.id === item.id && b.type === item.type));
      return [item, ...filtered];
    });
  }, [setBlacklist]);

  const removeBlacklist = useCallback((id: number, type: string) => {
    setBlacklist(prev => prev.filter(b => !(b.id === id && b.type === type)));
  }, [setBlacklist]);

  const isBlacklisted = useCallback((id: number, type: string) => {
    return blacklist.some(b => b.id === id && b.type === type);
  }, [blacklist]);

  const toggleBlacklist = useCallback((item: BlacklistItem) => {
    if (isBlacklisted(item.id, item.type)) {
      removeBlacklist(item.id, item.type);
    } else {
      addBlacklist(item);
    }
  }, [isBlacklisted, addBlacklist, removeBlacklist]);

  return { blacklist, addBlacklist, removeBlacklist, isBlacklisted, toggleBlacklist };
}
