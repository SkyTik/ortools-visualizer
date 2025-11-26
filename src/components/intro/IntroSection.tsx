import { Card, CardContent } from '@/components/ui/card';
import { Info, Keyboard, MousePointer } from 'lucide-react';

export function IntroSection() {
  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">
              Explore how different algorithms solve the Traveling Salesman Problem
            </p>
            <p className="text-muted-foreground">
              Select a location count and algorithm, then step through to see how each
              strategy builds a route from the depot (gold star) back to itself.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MousePointer className="h-3 w-3" />
                Click Next/Back
              </span>
              <span className="inline-flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                <kbd className="px-1.5 py-0.5 bg-muted rounded">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">→</kbd>
                arrows
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Home</kbd>
                /
                <kbd className="px-1.5 py-0.5 bg-muted rounded">End</kbd>
                jump
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
