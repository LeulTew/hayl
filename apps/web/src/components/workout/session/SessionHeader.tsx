import { SectionHeader } from '../../ui/SectionHeader';
import { Button } from '../../ui/Button';
import { GlobalTimer } from '../GlobalTimer';

interface SessionHeaderProps {
  dayTitle: string;
  startTime: number;
  onAbort?: () => void;
}

export function SessionHeader({ dayTitle, startTime, onAbort }: SessionHeaderProps) {
  return (
    <header className="mb-6 flex justify-between items-end">
      <SectionHeader 
        title="ACTIVE SESSION" 
        subtitle={dayTitle} 
      />
      <div className="flex flex-col items-end gap-2">
        <GlobalTimer startTime={startTime} isActive={true} />
        {onAbort && (
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-hayl-danger h-auto py-0 px-2 text-xs font-mono opacity-50 hover:opacity-100"
                onClick={onAbort}
            >
                ABORT
            </Button>
        )}
      </div>
    </header>
  );
}
