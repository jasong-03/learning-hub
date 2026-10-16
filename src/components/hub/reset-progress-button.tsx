'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetProgress, useProgress } from '@/lib/progress/store';

export function ResetProgressButton() {
  const progress = useProgress();
  const isEmpty =
    Object.keys(progress.completed).length + Object.keys(progress.checklist).length + Object.keys(progress.quizzes).length === 0;
  const confirmReset = (): void => {
    if (window.confirm('Reset lesson, lab, checklist and quiz progress for every course in this browser?')) resetProgress();
  };
  return (
    <Button variant="ghost" size="sm" onClick={confirmReset} disabled={isEmpty}>
      <RotateCcw />
      Reset progress
    </Button>
  );
}
