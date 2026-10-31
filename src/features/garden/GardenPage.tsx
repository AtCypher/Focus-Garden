import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DecorationKind, TilePosition } from '@/types';
import { DECORATION_INFO } from '@/data/decorations';
import { useAppStore } from '@/app/store/appStore';
import { SegmentedControl } from '@/app/ui/SegmentedControl';
import { Button } from '@/app/ui/Button';
import { ConfirmDialog } from '@/app/ui/Dialog';
import { BIOME_BY_ID } from '@/data/biomes';
import { nextGardenLevel, levelProgress } from '@/data/gardenLevels';
import { formatHours } from '@/lib/dates';
import { GardenScene } from './GardenScene';
import { PanZoom } from './PanZoom';
import { GardenBeds } from './GardenBeds';
import { PlantDetail } from './PlantDetail';
import { useGarden } from './useGarden';
import { PERIODS, type Period } from './periods';
import { season as seasonOf, timeOfDay, TIME_TINTS } from './daylight';
import { biomeRegions, nextFreeTile, type GardenLayout } from './layout';
import { unlockedBiomes, type GardenLevel } from '@/data/gardenLevels';
import { renderGardenPng, shareOrDownload } from './shareImage';
import { ambient, AmbientPlayer } from '@/features/timer/audio';
import { recordSightings, visitorsToday } from '@/features/collection/rituals';
import { dayKey } from '@/lib/dates';
import { evaluateStreak } from '@/features/stats/streaks';
import { VISITOR_BY_ID } from '@/data/visitors';
import { useUiStore } from '@/app/store/uiStore';
import { formatHours as fmtHours } from '@/lib/dates';

export function GardenPage() {
  const [period, setPeriod] = useState<Period>('all');
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<string | null>(null);
  const [arranging, setArranging] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);
  const seasons = useAppStore((s) => s.settings.seasons);
  const view = useAppStore((s) => s.settings.gardenView);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const movePlant = useAppStore((s) => s.movePlant);
  const removePlant = useAppStore((s) => s.removePlant);
  const removeWiltedPlants = useAppStore((s) => s.removeWiltedPlants);
  const [composting, setComposting] = useState<'one' | 'all' | null>(null);
  const moveDecoration = useAppStore((s) => s.moveDecoration);
  const placeDecoration = useAppStore((s) => s.placeDecoration);
  const removeDecoration = useAppStore((s) => s.removeDecoration);
  const wallet = useAppStore((s) => s.wallet);
  const decorations = useAppStore((s) => s.decorations);
  const [placing, setPlacing] = useState<DecorationKind | null>(null);
  const showToast = useUiStore((s) => s.showToast);
  const [sharing, setSharing] = useState(false);
  const [listening, setListening] = useState(false);
  const ambientVolume = useAppStore((s) => s.settings.ambientVolume);
  useEffect(() => () => ambient.stop(), []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { level, totalMinutes, layout, restoration, shown, plants, sessions } = useGarden(
    period,
    now,
  );
  const collection = useAppStore((s) => s.progress);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const dailyGoal = useAppStore((s) => s.settings.dailyGoalMinutes);
  const streakState = useAppStore((s) => s.streak);
  const freezes = useAppStore((s) => s.wallet.streakFreezes);
  const today = dayKey(now);
  const visitors = useMemo(
    () => visitorsToday(today, level, restoration, timeOfDay(new Date(now)), layout.occupied),
    [today, level, restoration, now, layout.occupied],
  );
  const weather = useMemo(() => {
    const st = evaluateStreak(sessions, dailyGoal, streakState, freezes, now);
    const wiltedToday = sessions.some((s) => s.outcome === 'wilted' && dayKey(s.endedAt) === today);
    if (st.todayMet && st.display >= 3) return 'sun' as const;
    if (st.todayMet) return 'rain' as const;
    if (wiltedToday) return 'mist' as const;
    return null;
  }, [sessions, dailyGoal, streakState, freezes, now, today]);
  useEffect(() => {
    const r = recordSightings(collection, visitors, today, new Date(now).toISOString());
    if (!r) return;
    updateProgress(r.patch);
    if (r.firstSeen.length > 0) {
      const names = r.firstSeen.map((id) => VISITOR_BY_ID[id]?.name.toLowerCase()).filter(Boolean);
      showToast(
        `New visitor${names.length > 1 ? 's' : ''}: ${names.join(', ')}. Added to your collection.`,
      );
    }
  }, [collection, visitors, today, now, updateProgress, showToast]);
  const next = nextGardenLevel(totalMinutes);
  const progress = levelProgress(totalMinutes);
  const selectedPlant = useMemo(
    () => plants.find((p) => p.id === selected) ?? null,
    [plants, selected],
  );
  const regions = biomeRegions(level);
  const time = timeOfDay(new Date(now));

  const inventory = (Object.keys(DECORATION_INFO) as DecorationKind[])
    .map((kind) => ({
      kind,
      free:
        (wallet.ownedDecorations[kind] ?? 0) - decorations.filter((d) => d.kind === kind).length,
    }))
    .filter((x) => x.free > 0);

  const share = async () => {
    const svg = document.getElementById('garden-scene') as SVGSVGElement | null;
    if (!svg) return;
    setSharing(true);
    try {
      const dark = document.documentElement.classList.contains('dark');
      const blob = await renderGardenPng({
        svg,
        caption: `${fmtHours(totalMinutes)} of focus, ${layout.placed.length} plants`,
        subcaption: `${level.name}, level ${level.level} of 7${period !== 'all' ? ` · ${PERIODS.find((p) => p.id === period)?.label}` : ''}`,
        dark,
      });
      const result = await shareOrDownload(
        blob,
        `grove-garden-${new Date().toISOString().slice(0, 10)}.png`,
        'My Grove garden',
      );
      showToast(result === 'shared' ? 'Shared.' : 'Image downloaded.');
    } catch (err) {
      console.error(err);
      showToast('Could not create the image.');
    } finally {
      setSharing(false);
    }
  };

  const onTile = (tile: TilePosition) => {
    if (placing) {
      placeDecoration(placing, tile);
      setPlacing(null);
      showToast('Placed. Tap another empty tile to move it again, or Done arranging.');
      return;
    }
    if (!moving) return;
    if (plants.some((p) => p.id === moving)) movePlant(moving, tile);
    else moveDecoration(moving, tile);
    setMoving(null);
    setSelected(null);
    showToast('Moved.');
  };

  /** In arrange mode a tap on a plant or decoration picks it up; a second item swaps places. */
  const onPick = (id: string) => {
    if (!arranging) {
      setSelected((cur) => (cur === id ? null : id));
      return;
    }
    setPlacing(null);
    if (moving && moving !== id) {
      const a = layout.placed.find((p) => p.plant.id === moving);
      const b = layout.placed.find((p) => p.plant.id === id);
      const da = layout.decorations.find((d) => d.id === moving);
      const db = layout.decorations.find((d) => d.id === id);
      const tileA = a?.tile ?? da?.tile;
      const tileB = b?.tile ?? db?.tile;
      if (tileA && tileB) {
        if (a) movePlant(moving, tileB);
        else moveDecoration(moving, tileB);
        if (b) movePlant(id, tileA);
        else moveDecoration(id, tileA);
        showToast('Swapped.');
      }
      setMoving(null);
      setSelected(null);
      return;
    }
    if (moving === id) {
      setMoving(null);
      setSelected(null);
      return;
    }
    setMoving(id);
    setSelected(id);
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

      <div className="flex items-center justify-between gap-2" data-tour="garden">
        <SegmentedControl
          label="Garden view"
          className="w-44"
          options={[
            { value: 'beds', label: 'Beds' },
            { value: 'map', label: 'Map' },
          ]}
          value={view}
          onChange={(v) => {
            updateSettings({ gardenView: v });
            setMoving(null);
            setPlacing(null);
          }}
        />
        <p className="text-muted text-xs">
          {view === 'beds'
            ? 'Scroll to browse. Tap a plant for details.'
            : 'Drag to pan, pinch or scroll to zoom.'}
        </p>
      </div>

      {view === 'beds' && (
        <GardenBeds
          level={level}
          plants={shown}
          decorations={layout.decorations}
          restoration={restoration}
          time={time}
          season={seasons ? seasonOf(new Date(now)) : null}
          visitors={visitors}
          weather={weather}
          selectedId={selected}
          arranging={arranging}
          onSelectPlant={onPick}
          onSelectDecoration={onPick}
        />
      )}

      <PanZoom
        className={view === 'map' ? 'h-[52vh] min-h-72 rounded-3xl' : 'hidden h-0 w-0'}
        style={{ background: TIME_TINTS[time].skyBottom }}
      >
        <GardenScene
          id="garden-scene"
          level={level}
          layout={layout}
          restoration={restoration}
          time={time}
          season={seasons ? seasonOf(new Date(now)) : null}
          visitors={visitors}
          weather={weather}
          selectedId={selected}
          arranging={arranging && (moving !== null || placing !== null)}
          onSelectPlant={onPick}
          onSelectDecoration={onPick}
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
        <span className="flex flex-wrap gap-2">
          {plants.some((p) => p.wilted) && (
            <Button size="sm" variant="danger" onClick={() => setComposting('all')}>
              Compost wilted ({plants.filter((p) => p.wilted).length})
            </Button>
          )}
          {level.features.includes('ambient') && AmbientPlayer.supported() && (
            <Button
              size="sm"
              variant={listening ? 'primary' : 'secondary'}
              aria-pressed={listening}
              onClick={() => {
                if (listening) ambient.stop();
                else
                  ambient.play(
                    timeOfDay(new Date(now)) === 'night' ? 'stream' : 'forest',
                    ambientVolume,
                  );
                setListening(!listening);
              }}
            >
              {listening ? 'Quiet' : 'Listen'}
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void share()}
            disabled={sharing || layout.placed.length === 0}
          >
            {sharing ? 'Rendering…' : 'Share image'}
          </Button>
          <Button
            size="sm"
            variant={arranging ? 'primary' : 'secondary'}
            aria-pressed={arranging}
            onClick={() => {
              setArranging((a) => !a);
              setMoving(null);
              setPlacing(null);
            }}
          >
            {arranging ? 'Done arranging' : 'Arrange'}
          </Button>
        </span>
      </div>
      {arranging && (
        <div className="card flex flex-col gap-2 p-3">
          <p className="text-muted text-xs" role="status">
            {placing
              ? `Tap an empty tile to place the ${DECORATION_INFO[placing].name.toLowerCase()}.`
              : moving
                ? view === 'beds'
                  ? 'Picked up. Tap another plant to swap places (switch to Map to move onto a free tile).'
                  : 'Picked up. Tap a blue tile to move it there, or tap another plant to swap places.'
                : view === 'beds'
                  ? 'Tap a plant to pick it up, then another to swap places. Or place something you own:'
                  : 'Tap a plant or decoration to pick it up. Blue tiles are free. Or place something you own:'}
          </p>
          {inventory.length > 0 ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Decorations to place">
              {inventory.map(({ kind, free }) => (
                <Button
                  key={kind}
                  size="sm"
                  variant={placing === kind ? 'primary' : 'secondary'}
                  aria-pressed={placing === kind}
                  onClick={() => {
                    setMoving(null);
                    if (view === 'beds') {
                      // No tiles to tap in the beds view: put it on the first free tile.
                      const tile = nextFreeAnywhere(level, layout.occupied);
                      if (tile) {
                        placeDecoration(kind, tile);
                        showToast(
                          `${DECORATION_INFO[kind].name} placed. Switch to Map to move it.`,
                        );
                      } else showToast('No free tile left.');
                      return;
                    }
                    setPlacing((p) => (p === kind ? null : kind));
                  }}
                >
                  {DECORATION_INFO[kind].name} ×{free}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted text-xs">
              No unplaced decorations.{' '}
              <Link to="/seeds" className="font-medium text-moss-700 underline dark:text-moss-300">
                Buy some in the Seed Book.
              </Link>
            </p>
          )}
        </div>
      )}

      {selectedPlant && (
        <PlantDetail
          key={selectedPlant.id}
          plant={selectedPlant}
          onClose={() => setSelected(null)}
          onMove={arranging ? () => setMoving(selectedPlant.id) : undefined}
          onCompost={() => setComposting('one')}
        />
      )}
      {selected && !selectedPlant && arranging && (
        <div className="card flex items-center justify-between p-3 text-sm">
          <span>Decoration selected.</span>
          <span className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setMoving(selected)}>
              Move
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                removeDecoration(selected);
                setSelected(null);
              }}
            >
              Put away
            </Button>
          </span>
        </div>
      )}

      <ConfirmDialog
        open={composting !== null}
        title={
          composting === 'all' ? 'Compost all wilted plants?' : 'Remove this plant from the garden?'
        }
        confirmLabel={composting === 'all' ? 'Compost them' : 'Remove'}
        danger
        onCancel={() => setComposting(null)}
        onConfirm={() => {
          if (composting === 'all') {
            const n = removeWiltedPlants();
            showToast(`${n} wilted plant${n === 1 ? '' : 's'} composted.`);
          } else if (selectedPlant) {
            removePlant(selectedPlant.id);
            showToast('Removed from the garden.');
          }
          setComposting(null);
          setSelected(null);
        }}
      >
        The session stays in your history and stats; only the plant leaves the garden. This cannot
        be undone.
      </ConfirmDialog>

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

function nextFreeAnywhere(level: GardenLevel, occupied: GardenLayout['occupied']) {
  for (const biome of unlockedBiomes(level.level)) {
    const t = nextFreeTile(level, biome, occupied);
    if (t) return t;
  }
  return null;
}
