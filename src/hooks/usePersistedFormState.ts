"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_PREFIX = "sajilo:tool-state:";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredState<T> {
  data: T;
  timestamp: number;
}

/**
 * Persist and restore form state to/from localStorage with debounced saves.
 *
 * @param toolSlug - unique tool identifier used as localStorage key namespace
 * @param initialState - default form values
 * @param debounceMs - debounce delay before persisting (default 500ms)
 *
 * @returns [state, setState, { wasRestored, clearSaved }]
 */
export function usePersistedFormState<T extends Record<string, any>>(
  toolSlug: string,
  initialState: T,
  debounceMs = 500
): [T, (updater: T | ((prev: T) => T)) => void, { wasRestored: boolean; clearSaved: () => void }] {
  const key = STORAGE_PREFIX + toolSlug;

  // Try to load saved state on first render
  const [wasRestored, setWasRestored] = useState(false);
  const [state, setStateInternal] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initialState;
      const stored: StoredState<T> = JSON.parse(raw);
      if (Date.now() - stored.timestamp > TTL_MS) {
        localStorage.removeItem(key);
        return initialState;
      }
      return { ...initialState, ...stored.data };
    } catch {
      return initialState;
    }
  });

  // Mark restoration after initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const stored: StoredState<T> = JSON.parse(raw);
        if (Date.now() - stored.timestamp <= TTL_MS) {
          setWasRestored(true);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestState = useRef(state);
  latestState.current = state;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const payload: StoredState<T> = {
          data: latestState.current,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {}
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, key, debounceMs]);

  // Public setter
  const setState = useCallback((updater: T | ((prev: T) => T)) => {
    setStateInternal((prev) => {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater;
      return next;
    });
  }, []);

  // Clear saved state
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setStateInternal(initialState);
    setWasRestored(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState, { wasRestored, clearSaved }];
}
