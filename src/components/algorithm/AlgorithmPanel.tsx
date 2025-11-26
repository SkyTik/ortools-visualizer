import { useState } from 'react';
import { ChevronLeft, ChevronRight, FastForward, Rewind, Code, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Strategy, Step, Candidate } from '@/types';
import { locations } from '@/data/locations';

interface AlgorithmPanelProps {
  strategy: Strategy;
  currentStep: Step | null;
  finalDistance: number;
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

export function AlgorithmPanel({
  strategy,
  currentStep,
  finalDistance,
  stepIndex,
  totalSteps,
  onBack,
  onNext,
  onReset,
  canGoBack,
  canGoNext,
}: AlgorithmPanelProps) {
  const [activeTab, setActiveTab] = useState('details');
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  const isComplete = stepIndex === totalSteps - 1;

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Header with Strategy Name */}
      <div className="flex-shrink-0 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
          <h3 className="text-sm font-semibold text-slate-700">{strategy.name}</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 pl-4.5 line-clamp-2">
          {strategy.shortDesc}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 px-4 pt-3">
          <TabsList className="w-full grid grid-cols-2 bg-slate-100 h-9">
            <TabsTrigger value="details" className="gap-1.5 text-xs h-8">
              <Info className="h-3.5 w-3.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="pseudocode" className="gap-1.5 text-xs h-8">
              <Code className="h-3.5 w-3.5" />
              Pseudocode
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Details Tab */}
        <TabsContent value="details" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {currentStep ? (
              <div className="space-y-3">
                {/* Explanation */}
                <p className="text-sm text-slate-700 leading-relaxed">
                  {currentStep.explanation}
                </p>

                {/* Distance Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Current</p>
                    <p className="text-lg font-bold font-mono text-slate-800">
                      {currentStep.totalDistance}
                    </p>
                  </div>
                  {finalDistance > 0 && (
                    <div className="flex-1 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Final</p>
                      <p className="text-lg font-bold font-mono text-emerald-700">
                        {finalDistance}
                      </p>
                    </div>
                  )}
                </div>

                {/* Candidates */}
                {currentStep.candidates && currentStep.candidates.length > 0 && (
                  <CandidatesList candidates={currentStep.candidates} />
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
            )}
          </div>

          {/* Navigation Controls - Fixed at Bottom */}
          <NavigationControls
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            progress={progress}
            isComplete={isComplete}
            onBack={onBack}
            onNext={onNext}
            onReset={onReset}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
          />
        </TabsContent>

        {/* Pseudocode Tab */}
        <TabsContent value="pseudocode" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-[13px] bg-slate-900 text-slate-300 rounded-lg p-4 overflow-x-auto leading-relaxed font-mono h-full">
              {strategy.pseudocode}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NavigationControlsProps {
  stepIndex: number;
  totalSteps: number;
  progress: number;
  isComplete: boolean;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
}

function NavigationControls({
  stepIndex,
  totalSteps,
  progress,
  isComplete,
  onBack,
  onNext,
  onReset,
  canGoBack,
  canGoNext,
}: NavigationControlsProps) {
  return (
    <div className="flex-shrink-0 border-t border-slate-100 p-4 bg-slate-50/50">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-800">{stepIndex + 1}</span>
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
      <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
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
          disabled={stepIndex === 0}
          className="h-9 w-9 rounded-lg"
        >
          <Rewind className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={!canGoBack}
          className="h-9 px-4 rounded-lg gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className={`h-9 px-5 rounded-lg gap-1 text-sm ${
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
            for (let i = stepIndex; i < totalSteps - 1; i++) {
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
      <p className="mt-3 text-[11px] text-center text-slate-400">
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">←</kbd>
        {' '}<kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">→</kbd>
        {' '}arrows | {' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Home</kbd>
        {' '}<kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">End</kbd>
      </p>
    </div>
  );
}

function CandidatesList({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
        Candidates
      </p>
      <div className="flex flex-wrap gap-1.5">
        {candidates.map((candidate) => (
          <span
            key={candidate.node}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
              ${candidate.selected
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600'
              }
            `}
          >
            <span>{locations[candidate.node]?.label ?? `Node ${candidate.node}`}</span>
            <span className={`font-mono text-[11px] ${candidate.selected ? 'text-emerald-100' : 'text-slate-400'}`}>
              ({candidate.distance})
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
