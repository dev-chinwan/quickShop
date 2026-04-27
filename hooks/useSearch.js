'use client';

import { useState, useCallback, useEffect } from 'react';
import { searchProducts } from '@/lib/api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let active = true;

    const timer = setTimeout(() => {
      setLoading(true);
      searchProducts(query)
        .then(({ data }) => {
          if (active) {
            setResults(data);
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setOpen(false);
  }, []);

  return { query, setQuery, results, loading, open, setOpen, clear };
}
