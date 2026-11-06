import { useCallback, useEffect, useRef, useState } from 'react';

const getErrorMessage = (error, fallback = 'Could not load data.') => {
  if (!error?.response) {
    return 'Unable to reach the server. Please try again.';
  }

  const data = error.response.data;

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (typeof data === 'string' && data) {
    return data;
  }

  return fallback;
};

// Small data-fetching hook shared by the dashboard blocks. Each block loads
// independently and can retry on its own without blanking the rest of the page.
export function useAsyncData(fetcher) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;

    setState((prev) => ({ ...prev, loading: true, error: '' }));

    fetcherRef.current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: '' });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error: getErrorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const retry = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { ...state, retry };
}
