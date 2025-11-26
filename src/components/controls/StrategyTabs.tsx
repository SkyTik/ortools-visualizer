import { strategies, strategyOrder } from '@/data/strategies';
import { cn } from '@/lib/utils';
import { Cpu, ExternalLink, AlertTriangle } from 'lucide-react';

interface StrategyTabsProps {
  value: string;
  onChange: (strategy: string) => void;
}

export function StrategyTabs({ value, onChange }: StrategyTabsProps) {
  return (
    <div className="space-y-2.5">
      <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-slate-400" />
        Strategy
      </label>

      <div className="flex flex-wrap gap-1.5">
        {strategyOrder.map((strategyId) => {
          const strategy = strategies[strategyId];
          const isSelected = value === strategyId;

          return (
            <button
              key={strategyId}
              onClick={() => onChange(strategyId)}
              title={strategy.shortDesc}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {strategy.name}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 leading-relaxed flex items-center gap-1.5">
        <span>{strategies[value]?.shortDesc}</span>
        {strategies[value]?.wikipediaUrl && (
          <a
            href={strategies[value].wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-indigo-500 hover:text-indigo-600 transition-colors"
            title="Learn more on Wikipedia"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </p>

      {strategies[value]?.warning && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{strategies[value].warning}</p>
        </div>
      )}
    </div>
  );
}
