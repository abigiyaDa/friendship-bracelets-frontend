import { useCallback, useEffect, useRef, useState } from 'react';

// Small fetch hook for storefront pages: { data, loading, error, reload }.
// `deps` re-runs the fetch when they change (like useEffect).
export function useAsync(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;

    setState((prev) => ({ ...prev, loading: true, error: '' }));

    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((data) => {
        if (active) setState({ data, loading: false, error: '' });
      })
      .catch((error) => {
        if (active) {
          const status = error?.response?.status;
          const detail = error?.response?.data?.detail;
          let message = 'Could not load this right now. Please try again.';
          if (status === 429) message = 'Too many attempts — please wait a moment and try again.';
          else if (typeof detail === 'string') message = detail;
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, ...deps]);

  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { ...state, reload };
}
