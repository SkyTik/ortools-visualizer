import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  value: number;
  onChange: (count: number) => void;
}

const LOCATION_COUNTS = [5, 6, 7, 8, 9, 10];

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-400" />
        Locations
      </label>
      <div className="flex gap-2">
        {LOCATION_COUNTS.map((count) => (
          <button
            key={count}
            onClick={() => onChange(count)}
            className={cn(
              'flex-1 h-9 rounded-lg text-sm font-medium transition-colors',
              value === count
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}
