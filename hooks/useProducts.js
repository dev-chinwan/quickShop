'use client';

import { useEffect, useState } from 'react';
import { fetchProducts, fetchFeaturedProducts } from '@/lib/api';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let active = true;

    setLoading(true);
    fetchProducts(filters)
      .then(({ data }) => {
        if (active) {
          setProducts(data);
          setError(null);
        }
      })
      .catch((nextError) => {
        if (active) {
          setError(nextError);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filtersKey]);

  return { products, loading, error };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchFeaturedProducts()
      .then(({ data }) => {
        if (active) {
          setProducts(data);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
