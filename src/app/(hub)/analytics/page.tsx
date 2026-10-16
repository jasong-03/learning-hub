import type { Metadata } from 'next';
import { AnalyticsBoard } from '@/components/hub/analytics-board';
import { HubPage } from '@/components/hub/hub-page';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <HubPage title="Analytics" description="How your learning is going, computed from progress saved in this browser.">
      <AnalyticsBoard />
    </HubPage>
  );
}
