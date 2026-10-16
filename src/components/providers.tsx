'use client';

import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { HubSearchDialog } from '@/components/search/search-dialog';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ defaultTheme: 'dark' }} search={{ SearchDialog: HubSearchDialog }}>
      {children}
    </RootProvider>
  );
}
