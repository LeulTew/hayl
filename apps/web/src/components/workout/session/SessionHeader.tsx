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
    <header className="mb-6 flex justify-between items-start">
      <SectionHeader 
        title="ACTIVE SESSION" 
        subtitle={dayTitle} 
      />
      <div className="flex flex-col items-end gap-3">
        <GlobalTimer startTime={startTime} isActive={true} />
        {onAbort && (
            <Button 
                variant="outline" 
                size="sm" 
                className="
                    border-hayl-danger/50 text-hayl-danger hover:bg-hayl-danger hover:text-white
                    h-7 px-4 text-xs font-heading font-bold tracking-wider
                "
                onClick={onAbort}
            >
                ABORT
            </Button>
        )}
      </div>
    </header>
  );
}
