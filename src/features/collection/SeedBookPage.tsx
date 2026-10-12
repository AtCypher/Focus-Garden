import { useMemo, useState } from 'react';
import type { DecorationKind, Species } from '@/types';
import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { SegmentedControl } from '@/app/ui/SegmentedControl';
import { Button } from '@/app/ui/Button';
import { DewPill } from '@/app/ui/DewPill';
import { IconLock } from '@/app/ui/icons';
import { SPECIES } from '@/data/species';
import { BIOMES } from '@/data/biomes';
import { OUTFITS } from '@/data/outfits';
import { DECORATION_INFO } from '@/data/decorations';
import { PlantArt } from '@/art/PlantArt';
import { Companion } from '@/art/Companion';
import { DecorationArt } from '@/art/Decorations';
import { grownCounts, speciesStatus, unlockContext } from './unlocks';

type Tab = 'species' | 'decorations' | 'outfits';

export function SeedBookPage() {
  const [tab, setTab] = useState<Tab>('species');
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Seed Book</h1>
        <DewPill />
      </header>
      <SegmentedControl
        label="Collection"
        options={[
          { value: 'species', label: 'Species' },
          { value: 'decorations', label: 'Decorations' },
          { value: 'outfits', label: 'Outfits' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'species' && <SpeciesTab />}
      {tab === 'decorations' && <DecorationsTab />}
      {tab === 'outfits' && <OutfitsTab />}
    </div>
  );
}

function SpeciesTab() {
  const sessions = useAppStore((s) => s.sessions);
  const plants = useAppStore((s) => s.plants);
  const wallet = useAppStore((s) => s.wallet);
  const bestStreak = useAppStore((s) => s.streak.best);
  const buySpecies = useAppStore((s) => s.buySpecies);
  const showToast = useUiStore((s) => s.showToast);
  const ctx = useMemo(
    () => unlockContext(sessions, wallet, bestStreak),
    [sessions, wallet, bestStreak],
  );
  const counts = useMemo(() => grownCounts(plants), [plants]);
  const owned = SPECIES.filter((s) => wallet.ownedSpeciesIds.includes(s.id)).length;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted text-sm">
        {owned} of {SPECIES.length} species collected.
      </p>
      {BIOMES.map((biome) => {
        const list = SPECIES.filter((s) => s.biome === biome.id);
        const open = biome.unlockLevel <= ctx.level;
        return (
          <section key={biome.id} aria-labelledby={`biome-${biome.id}`}>
            <h2
              id={`biome-${biome.id}`}
              className="mb-2 flex items-center gap-2 text-base font-semibold"
            >
              {biome.name}
              {!open && (
                <span className="text-muted inline-flex items-center gap-1 text-xs font-normal">
                  <IconLock width={14} height={14} /> opens at garden level {biome.unlockLevel}
                </span>
              )}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {list.map((s) => (
                <SpeciesCard
                  key={s.id}
                  species={s}
                  status={speciesStatus(s, ctx)}
                  grown={counts[s.id] ?? 0}
                  onBuy={() => {
                    if (buySpecies(s.id, s.dewCost)) showToast(`${s.name} added to your seeds.`);
                  }}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const RARITY_CLASS: Record<Species['rarity'], string> = {
  common: 'text-muted',
  uncommon: 'text-moss-600 dark:text-moss-300',
  rare: 'text-dew-600 dark:text-dew-300',
  legendary: 'text-sun-500',
};

function SpeciesCard({
  species,
  status,
  grown,
  onBuy,
}: {
  species: Species;
  status: ReturnType<typeof speciesStatus>;
  grown: number;
  onBuy: () => void;
}) {
  const locked = status.kind !== 'owned';
  return (
    <li className="card flex flex-col items-center p-3 text-center">
      <div
        className={locked ? 'opacity-70 grayscale' : ''}
        style={locked ? { filter: 'grayscale(1) contrast(0.4) brightness(0.9)' } : undefined}
      >
        <PlantArt
          species={species}
          growth={1}
          size={88}
          seed={0.4}
          title={locked ? `${species.name} (locked)` : species.name}
        />
      </div>
      <p className="mt-1 text-sm font-medium">{species.name}</p>
      <p className={`text-xs capitalize ${RARITY_CLASS[species.rarity]}`}>{species.rarity}</p>
      {status.kind === 'owned' && (
        <>
          <p className="text-muted mt-1 text-xs italic">{species.flavour}</p>
          <p className="text-muted mt-1 text-xs">
            Grown {grown} time{grown === 1 ? '' : 's'}
          </p>
        </>
      )}
      {status.kind === 'buyable' && (
        <Button
          size="sm"
          className="mt-2"
          onClick={onBuy}
          disabled={!status.affordable}
          aria-label={`Buy ${species.name} for ${status.cost} dew`}
        >
          {status.cost} dew
        </Button>
      )}
      {status.kind === 'locked' && (
        <div className="mt-2 w-full">
          <p className="text-muted text-xs">{status.hint}</p>
          <div
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-moss-100 dark:bg-moss-800"
            role="progressbar"
            aria-valuenow={Math.round(status.progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${species.name} unlock progress`}
          >
            <div
              className="h-full rounded-full bg-moss-500"
              style={{ width: `${status.progress * 100}%` }}
            />
          </div>
        </div>
      )}
      {status.kind === 'biomeLocked' && <p className="text-muted mt-2 text-xs">{status.hint}</p>}
    </li>
  );
}

function DecorationsTab() {
  const wallet = useAppStore((s) => s.wallet);
  const decorations = useAppStore((s) => s.decorations);
  const buy = useAppStore((s) => s.buyDecoration);
  const showToast = useUiStore((s) => s.showToast);
  const kinds = Object.keys(DECORATION_INFO) as DecorationKind[];
  return (
    <div>
      <p className="text-muted mb-3 text-sm">
        Buy a decoration here, then place it from the garden in Arrange mode. You can own several of
        each.
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {kinds.map((kind) => {
          const info = DECORATION_INFO[kind];
          const owned = wallet.ownedDecorations[kind] ?? 0;
          const placed = decorations.filter((d) => d.kind === kind).length;
          return (
            <li key={kind} className="card flex flex-col items-center p-3 text-center">
              <svg viewBox="-40 -70 80 90" width="80" height="90" aria-hidden>
                <ellipse cx="0" cy="4" rx="30" ry="10" fill="#9ccb6b" opacity="0.6" />
                <DecorationArt kind={kind} />
              </svg>
              <p className="text-sm font-medium">{info.name}</p>
              <p className="text-muted text-xs italic">{info.blurb}</p>
              {owned > 0 && (
                <p className="text-muted mt-1 text-xs">
                  Owned {owned} · placed {placed}
                </p>
              )}
              <Button
                size="sm"
                className="mt-2"
                disabled={wallet.dew < info.cost}
                aria-label={`Buy ${info.name} for ${info.cost} dew`}
                onClick={() => {
                  if (buy(kind, info.cost))
                    showToast(`${info.name} bought. Place it in the garden.`);
                }}
              >
                {info.cost} dew
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OutfitsTab() {
  const wallet = useAppStore((s) => s.wallet);
  const current = useAppStore((s) => s.settings.companionOutfitId);
  const name = useAppStore((s) => s.settings.companionName);
  const update = useAppStore((s) => s.updateSettings);
  const spend = useAppStore((s) => s.spendDew);
  const buyOutfit = useAppStore((s) => s.buyOutfit);
  const showToast = useUiStore((s) => s.showToast);
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {OUTFITS.map((o) => {
        const owned = wallet.ownedOutfitIds.includes(o.id);
        const equipped = current === o.id;
        return (
          <li key={o.id} className="card flex flex-col items-center p-3 text-center">
            <Companion
              mood={equipped ? 'happy' : 'idle'}
              outfitId={o.id}
              size={88}
              label={`${name} wearing ${o.name}`}
            />
            <p className="text-sm font-medium">{o.name}</p>
            <p className="text-muted text-xs italic">{o.blurb}</p>
            {owned ? (
              <Button
                size="sm"
                variant={equipped ? 'secondary' : 'primary'}
                className="mt-2"
                disabled={equipped}
                onClick={() => update({ companionOutfitId: o.id })}
              >
                {equipped ? 'Wearing' : 'Wear'}
              </Button>
            ) : (
              <Button
                size="sm"
                className="mt-2"
                disabled={wallet.dew < o.cost}
                aria-label={`Buy ${o.name} for ${o.cost} dew`}
                onClick={() => {
                  if (spend(o.cost)) {
                    buyOutfit(o.id);
                    update({ companionOutfitId: o.id });
                    showToast(`${name} is wearing the ${o.name.toLowerCase()}.`);
                  }
                }}
              >
                {o.cost} dew
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
