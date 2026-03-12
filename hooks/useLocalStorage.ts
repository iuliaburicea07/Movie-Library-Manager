'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_PREFIX } from '@/lib/constants';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = STORAGE_PREFIX + key;

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey);
      if (item) setStoredValue(JSON.parse(item));
    } catch {
      // ignore
    }
    const onSync = (e: Event) => {
      const { key, value } = (e as CustomEvent<{ key: string; value: string }>).detail;
      if (key === prefixedKey) {
        try { setStoredValue(JSON.parse(value)); } catch { /* ignore */ }
      }
    };
    window.addEventListener('ls-sync', onSync);
    return () => window.removeEventListener('ls-sync', onSync);
  }, [prefixedKey]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        const serialized = JSON.stringify(valueToStore);
        window.localStorage.setItem(prefixedKey, serialized);
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent('ls-sync', { detail: { key: prefixedKey, value: serialized } }));
        });
        return valueToStore;
      });
    } catch {
      // ignore
    }
  }, [prefixedKey]);

  return [storedValue, setValue] as const;
}
