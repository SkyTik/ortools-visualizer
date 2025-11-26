import { MainLayout } from '@/components/layout/MainLayout';
import { MapCanvas } from '@/components/map/MapCanvas';
import { LocationSelector } from '@/components/controls/LocationSelector';
import { StrategyTabs } from '@/components/controls/StrategyTabs';
import { AlgorithmPanel } from '@/components/algorithm/AlgorithmPanel';
import { useTSPDemo } from '@/hooks/useTSPDemo';
import { Cpu, Github, BookOpen, AlertCircle, X } from 'lucide-react';

function App() {
  const {
    locationCount,
    strategyId,
    locations,
    strategy,
    currentStep,
    stepIndex,
    totalSteps,
    finalDistance,
    canGoBack,
    canGoNext,
    goBack,
    goNext,
    reset,
    setLocationCount,
    setStrategyId,
    isLoading,
    error,
    clearError,
  } = useTSPDemo();

  return (
    <MainLayout
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                TSP First Solution Strategies
              </h1>
              <p className="text-sm text-slate-500">
                Google OR-Tools routing algorithms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://developers.google.com/optimization"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title="OR-Tools Documentation"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </a>
            <a
              href="https://github.com/google/or-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="google/or-tools on GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">OR-Tools</span>
            </a>
          </div>
        </div>
      }
      mapPanel={
        <MapCanvas
          locations={locations}
          currentStep={currentStep}
        />
      }
      controlPanel={
        <>
          {/* Error display */}
          {error && (
            <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800 flex-1">{error}</p>
              <button
                onClick={clearError}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          {/* Configuration */}
          <div className="flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <LocationSelector
              value={locationCount}
              onChange={setLocationCount}
            />
            <StrategyTabs
              value={strategyId}
              onChange={setStrategyId}
            />
          </div>

          {/* Algorithm Panel - takes remaining space with integrated navigation */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {isLoading ? (
              <div className="h-full bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                <div className="flex flex-col items-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-2" />
                  <p className="text-base">Loading...</p>
                </div>
              </div>
            ) : (
              <AlgorithmPanel
                strategy={strategy}
                currentStep={currentStep}
                finalDistance={finalDistance}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                onBack={goBack}
                onNext={goNext}
                onReset={reset}
                canGoBack={canGoBack}
                canGoNext={canGoNext}
              />
            )}
          </div>
        </>
      }
    />
  );
}

export default App;
