"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataProvider } from '@/contexts/DataContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </DataProvider>
  );
}
