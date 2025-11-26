import type { ReactNode } from 'react';

interface MainLayoutProps {
  /** Left panel - Map visualization */
  mapPanel: ReactNode;
  /** Right panel - Algorithm info and controls */
  controlPanel: ReactNode;
  /** Header content */
  header?: ReactNode;
}

export function MainLayout({ mapPanel, controlPanel, header }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      {header && (
        <header className="flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">
          {header}
        </header>
      )}

      {/* Main content - fills remaining height */}
      <main className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left: Map visualization - balanced size */}
        <div className="flex-1 min-w-0 max-w-[500px]">
          {mapPanel}
        </div>

        {/* Right: Controls and algorithm info - takes remaining space */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
          {controlPanel}
        </div>
      </main>
    </div>
  );
}
