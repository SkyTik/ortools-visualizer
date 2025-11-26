import { ChevronLeft, ChevronRight, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

export function StepControls({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onReset,
  canGoBack,
  canGoNext,
}: StepControlsProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const isComplete = currentStep === totalSteps - 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-800">{currentStep + 1}</span>
          <span className="text-slate-400">/</span>
          <span className="text-sm text-slate-500">{totalSteps}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
        }`}>
          {isComplete ? 'Complete' : `${Math.round(progress)}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={currentStep === 0}
          className="h-9 w-9 rounded-lg"
        >
          <Rewind className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={!canGoBack}
          className="h-9 px-4 rounded-lg gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className={`h-9 px-5 rounded-lg gap-1 ${
            isComplete ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            for (let i = currentStep; i < totalSteps - 1; i++) {
              setTimeout(() => onNext(), 0);
            }
          }}
          disabled={isComplete}
          className="h-9 w-9 rounded-lg"
        >
          <FastForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="mt-3 text-[10px] text-center text-slate-400">
        <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px] font-mono">←</kbd>
        {' '}<kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px] font-mono">→</kbd>
        {' '}arrows | {' '}
        <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px] font-mono">Home</kbd>
        {' '}<kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px] font-mono">End</kbd>
      </p>
    </div>
  );
}
