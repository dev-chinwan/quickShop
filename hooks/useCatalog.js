'use client';

import { useEffect, useState } from 'react';
import { fetchCategories, fetchOfferBanners } from '@/lib/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchCategories()
      .then(({ data }) => {
        if (active) {
          setCategories(data);
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

  return { categories, loading };
}

export function useOfferBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchOfferBanners()
      .then(({ data }) => {
        if (active) {
          setBanners(data);
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

  return { banners, loading };
}
