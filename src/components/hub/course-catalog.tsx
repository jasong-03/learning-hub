'use client';

import { useState, type ReactNode } from 'react';
import type { Course } from '@/domain/types';
import { cn } from '@/lib/utils';

interface CatalogEntry {
  course: Pick<Course, 'id' | 'categoryId' | 'level' | 'status'>;
  card: ReactNode;
}

interface FilterOption {
  value: string;
  label: string;
}

/** Client-side filters over server-rendered course cards. */
export function CourseCatalog({ entries, categories, levels }: { entries: CatalogEntry[]; categories: FilterOption[]; levels: FilterOption[] }) {
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const visible = entries.filter(
    ({ course }) =>
      (category === 'all' || course.categoryId === category) &&
      (level === 'all' || course.level === level) &&
      (status === 'all' || course.status === status),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <FilterGroup label="Category" value={category} onChange={setCategory} options={[{ value: 'all', label: 'All' }, ...categories]} />
        <FilterGroup label="Level" value={level} onChange={setLevel} options={[{ value: 'all', label: 'All' }, ...levels]} />
        <FilterGroup
          label="Status"
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Available' }, { value: 'planned', label: 'Planned' }]}
        />
      </div>
      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No courses match these filters.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ course, card }) => (
            <li key={course.id}>{card}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FilterGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: FilterOption[] }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs transition-colors',
            value === option.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
