import { useState } from 'react';
import type { Plant } from '@/types';
import { useAppStore } from '@/app/store/appStore';
import { getSpecies } from '@/data/species';
import { BIOME_BY_ID } from '@/data/biomes';
import { PlantArt } from '@/art/PlantArt';
import { Button } from '@/app/ui/Button';
import { IconClose } from '@/app/ui/icons';
import { formatMinutes } from '@/lib/dates';
import { inputClass } from '@/app/ui/Field';

interface Props {
  plant: Plant;
  onClose: () => void;
  onMove?: () => void;
}

export function PlantDetail({ plant, onClose, onMove }: Props) {
  const session = useAppStore((s) => s.sessions.find((x) => x.id === plant.sessionId));
  const tag = useAppStore((s) => s.tags.find((t) => t.id === session?.tagId));
  const updateNote = useAppStore((s) => s.updateSessionNote);
  const species = getSpecies(plant.speciesId);
  const [note, setNote] = useState(session?.note ?? '');

  const grown = new Date(plant.grownAt);
  return (
    <aside className="card flex gap-3 p-4" aria-label={`${species.name} details`}>
      <PlantArt
        species={species}
        growth={1}
        wilted={plant.wilted}
        variant={plant.variant}
        size={96}
        seed={0.4}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">
              {species.name}
              {plant.variant !== 'standard' && (
                <span className="text-muted ml-1 text-xs capitalize">({plant.variant})</span>
              )}
            </h2>
            <p className="text-muted text-xs">
              {BIOME_BY_ID[plant.biome].name} · {plant.wilted ? 'wilted' : 'grown'}{' '}
              {grown.toLocaleDateString(undefined, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}{' '}
              at {grown.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="focus-ring rounded-full p-1 hover:bg-moss-100 dark:hover:bg-moss-800"
          >
            <IconClose width={20} height={20} />
          </button>
        </div>
        {session && (
          <p className="mt-1 text-sm">
            {formatMinutes(session.actualMinutes)} focused
            {session.mode === 'pomodoro' && session.round ? `, round ${session.round}` : ''} ·{' '}
            {session.strictness}
            {tag && (
              <span
                className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{ background: `${tag.color}33`, color: tag.color }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: tag.color }} />{' '}
                {tag.name}
              </span>
            )}
          </p>
        )}
        {session && (
          <label className="mt-2 block text-xs">
            <span className="text-muted">Note</span>
            <textarea
              className={`${inputClass} mt-1 min-h-16 text-sm`}
              value={note}
              maxLength={280}
              placeholder="What were you working on?"
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== session.note && updateNote(session.id, note)}
            />
          </label>
        )}
        {onMove && (
          <Button size="sm" variant="secondary" className="mt-2" onClick={onMove}>
            Move
          </Button>
        )}
      </div>
    </aside>
  );
}
