'use client';

import dynamic from 'next/dynamic';

const StatsCounterPlayer = dynamic(
  () => import('@/components/players/StatsCounterPlayer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[100px] bg-surf border-t border-b border-[rgba(0,212,255,0.12)] animate-pulse" />
    ),
  }
);

export default function StatsBar() {
  return (
    <section className="relative z-[1] bg-surf border-t border-b border-[rgba(0,212,255,0.12)]">
      <StatsCounterPlayer />
    </section>
  );
}
