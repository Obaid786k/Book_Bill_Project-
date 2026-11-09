import { useEffect, useState } from 'react';

// Loads one admin RPC for a page: { data, error }.
export const useAdminData = (load) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    load()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message || 'Could not load admin data.'));
    return () => { alive = false; };
  }, [load]);
  return { data, error };
};
