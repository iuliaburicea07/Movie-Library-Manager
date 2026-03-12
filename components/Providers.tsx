'use client';

import { PageStateProvider } from '@/context/pageState';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PageStateProvider>{children}</PageStateProvider>;
}
