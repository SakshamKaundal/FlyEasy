'use client';

import { useState } from 'react';
import { UserInformation } from './types/application.types';
import UserContext from '@/components/context-api/save-user-context';
import Layout from './components/common_components/layout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInformation | null>(null);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, isRoundTrip, setIsRoundTrip }}>
      <Layout>{children}</Layout>
    </UserContext.Provider>
  );
}
