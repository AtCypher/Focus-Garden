import { useMemo } from 'react';
import type { EngineState } from './engine';
import { actualMinutes, calculateDew } from './engine';
import { Button } from '@/app/ui/Button';
import { PlantArt } from '@/art/PlantArt';
import { getSpecies } from '@/data/species';
import { IconDew } from '@/app/ui/icons';

interface Props {
  result: EngineState;
  dewEarned: number | null;
  onDone: () => void;
  onRetryShorter: (minutes: number) => void;
}

export function ResultView({ result, dewEarned, onDone, onRetryShorter }: Props) {
  const species = useMemo(() => getSpecies(result.config.speciesId), [result.config.speciesId]);
  const minutes = actualMinutes(result, result.finishedAt ?? result.startedAt);
  const outcome = result.outcome;
  const dew =
    dewEarned ??
    calculateDew({
      outcome: outcome ?? 'cancelled',
      actualMinutes: minutes,
      strictness: result.config.strictness,
      firstSessionOfDay: false,
    });
  const shorter = Math.max(10, Math.round((result.config.plannedMinutes || 25) / 2 / 5) * 5);

  const title =
    outcome === 'completed' ? 'Fully grown' : outcome === 'wilted' ? 'It wilted' : 'Cancelled';
  const body =
    outcome === 'completed'
      ? `${minutes} minute${minutes === 1 ? '' : 's'} of focus. Your ${species.name.toLowerCase()} is in the garden.`
      : outcome === 'wilted'
        ? `That happens. ${minutes > 0 ? `You still focused for ${minutes} minute${minutes === 1 ? '' : 's'}. ` : ''}Want to try a shorter one?`
        : 'No harm done. Nothing was planted.';

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-md flex-col items-center justify-center gap-5 p-6 text-center md:min-h-dvh">
      <PlantArt
        species={species}
        growth={outcome === 'completed' ? 1 : 0.5}
        stage={outcome === 'completed' ? 'full' : 'sapling'}
        wilted={outcome === 'wilted'}
        size={220}
      />
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="text-muted mt-2 max-w-xs text-sm">{body}</p>
      </div>
      {outcome === 'completed' && (
        <p
          className="inline-flex items-center gap-1 rounded-full bg-dew-300/40 px-3 py-1 text-sm font-medium text-dew-600 dark:text-dew-300"
          aria-label={`${dew} dew earned`}
        >
          <IconDew width={18} height={18} /> +{dew} dew
        </p>
      )}
      <div className="flex w-full flex-col gap-2">
        {outcome === 'wilted' && (
          <Button size="lg" onClick={() => onRetryShorter(shorter)}>
            Try {shorter} minutes
          </Button>
        )}
        <Button size="lg" variant={outcome === 'wilted' ? 'secondary' : 'primary'} onClick={onDone}>
          {outcome === 'completed' ? 'Plant another' : 'Back to planting'}
        </Button>
      </div>
    </div>
  );
}
