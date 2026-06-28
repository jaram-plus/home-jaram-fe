import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** App-root react-query provider. One QueryClient per app instance. */
export function QueryProvider({ children }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
