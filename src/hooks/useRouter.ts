import { useState, useEffect, useCallback } from 'react';

export interface Route {
  path: string;
  productId: string | null;
  query: Record<string, string>;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [rawPath, queryString] = hash.split('?');

  const query: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      query[key] = value;
    });
  }

  // Extract /product/:id
  const productMatch = rawPath.match(/^\/product\/(.+)$/);
  const productId = productMatch ? productMatch[1] : null;
  const path = productMatch ? '/product' : rawPath || '/';

  return { path, productId, query };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}
