import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TilePosition } from '@/types';
import { useAppStore } from '@/app/store/appStore';
import { SegmentedControl } from '@/app/ui/SegmentedControl';
import { Button } from '@/app/ui/Button';
import { BIOME_BY_ID } from '@/data/biomes';
import { nextGardenLevel, levelProgress } from '@/data/gardenLevels';
import { formatHours } from '@/lib/dates';
import { GardenScene } from './GardenScene';
import { PanZoom } from './PanZoom';
import { PlantDetail } from './PlantDetail';
import { useGarden } from './useGarden';
import { PERIODS, type Period } from './periods';
import { season as seasonOf, timeOfDay, TIME_TINTS } from './daylight';
import { biomeRegions } from './layout';

export function GardenPage() {
  const [period, setPeriod] = useState<Period>('all');
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<string | null>(null);
  const [arranging, setArranging] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);
  const seasons = useAppStore((s) => s.settings.seasons);
  const movePlant = useAppStore((s) => s.movePlant);
  const moveDecoration = useAppStore((s) => s.moveDecoration);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { level, totalMinutes, layout, restoration, shown, plants } = useGarden(period, now);
  const next = nextGardenLevel(totalMinutes);
  const progress = levelProgress(totalMinutes);
  const selectedPlant = useMemo(
    () => plants.find((p) => p.id === selected) ?? null,
    [plants, selected],
  );
  const regions = biomeRegions(level);
  const time = timeOfDay(new Date(now));

  const onTile = (tile: TilePosition) => {
    if (!moving) return;
    if (plants.some((p) => p.id === moving)) movePlant(moving, tile);
    else moveDecoration(moving, tile);
    setMoving(null);
    setSelected(null);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            {level.name}{' '}
            <span className="text-muted text-base font-normal">level {level.level} of 7</span>
          </h1>
          <p className="text-muted text-sm">{formatHours(totalMinutes)} of focus grown so far</p>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs">
            <span>{next ? `Next: ${next.name}` : 'Highest level reached'}</span>
            {next && (
              <span className="text-muted">{formatHours(next.minutes - totalMinutes)} to go</span>
            )}
          </div>
          <div
            className="mt-1 h-2 overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress to next garden level"
          >
            <div
              className="h-full rounded-full bg-moss-600 dark:bg-moss-400"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </header>

      <SegmentedControl
        label="Period"
        options={PERIODS.map((p) => ({ value: p.id, label: p.label }))}
        value={period}
        onChange={(p) => {
          setPeriod(p);
          setSelected(null);
        }}
      />

      <PanZoom
        className="h-[52vh] min-h-72 rounded-3xl"
        style={{ background: TIME_TINTS[time].skyBottom }}
      >
        <GardenScene
          level={level}
          layout={layout}
          restoration={restoration}
          time={time}
          season={seasons ? seasonOf(new Date(now)) : null}
          selectedId={selected}
          arranging={arranging && moving !== null}
          onSelectPlant={(id) => setSelected((cur) => (cur === id ? null : id))}
          onSelectDecoration={(id) => setSelected((cur) => (cur === id ? null : id))}
          onSelectTile={onTile}
        />
      </PanZoom>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted">
          {shown.length === 0
            ? period === 'all'
              ? 'Nothing planted yet.'
              : `Nothing grown ${period === 'today' ? 'today' : `this ${period}`} yet.`
            : `${layout.placed.length} plant${layout.placed.length === 1 ? '' : 's'} shown`}
          {layout.overflow.length > 0 &&
            ` · ${layout.overflow.length} more without room (still in your history)`}
          {shown.length === 0 && (
            <>
              {' '}
              <Link to="/" className="font-medium text-moss-700 underline dark:text-moss-300">
                Plant a seed
              </Link>
            </>
          )}
        </p>
        <Button
          size="sm"
          variant={arranging ? 'primary' : 'secondary'}
          aria-pressed={arranging}
          onClick={() => {
            setArranging((a) => !a);
            setMoving(null);
          }}
        >
          {arranging ? 'Done arranging' : 'Arrange'}
        </Button>
      </div>
      {arranging && (
        <p className="text-muted text-xs" role="status">
          {moving
            ? 'Now tap an empty tile in the same biome to move it there.'
            : 'Tap a plant or decoration, then "Move".'}
        </p>
      )}

      {selectedPlant && (
        <PlantDetail
          key={selectedPlant.id}
          plant={selectedPlant}
          onClose={() => setSelected(null)}
          onMove={arranging ? () => setMoving(selectedPlant.id) : undefined}
        />
      )}
      {selected && !selectedPlant && arranging && (
        <div className="card flex items-center justify-between p-3 text-sm">
          <span>Decoration selected.</span>
          <Button size="sm" variant="secondary" onClick={() => setMoving(selected)}>
            Move
          </Button>
        </div>
      )}

      <ul className="flex flex-wrap gap-2" aria-label="Biomes">
        {regions.map((r) => {
          const info = BIOME_BY_ID[r.biome];
          const pct = Math.round((restoration[r.biome] ?? 0) * 100);
          return (
            <li key={r.biome} className="card flex items-center gap-2 px-3 py-1.5 text-xs">
              <span
                className="h-3 w-3 rounded-sm"
                style={{
                  background: info.ground.top,
                  opacity: 0.3 + 0.7 * (restoration[r.biome] ?? 0),
                }}
                aria-hidden
              />
              <span className="font-medium">{info.name}</span>
              <span className="text-muted">{pct}% restored</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
