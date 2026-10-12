import { SPECIES } from '@/data/species';
import { PlantArt } from './PlantArt';
import { Companion, type CompanionMood } from './Companion';

/** Dev-only page (/gallery in dev and e2e builds) to eyeball every species at every stage. */
export function Gallery() {
  const growths = [0.05, 0.25, 0.6, 1];
  return (
    <div className="p-4">
      <h1 className="font-display text-2xl">Species gallery</h1>
      <div className="card mt-4 flex flex-wrap gap-2 p-3">
        {(
          ['idle', 'watering', 'humming', 'dozing', 'sad', 'happy', 'worried'] as CompanionMood[]
        ).map((m) => (
          <div key={m} className="text-center text-xs">
            <Companion mood={m} size={100} />
            <div>{m}</div>
          </div>
        ))}
        {['strawhat', 'scarf', 'beanie', 'glasses'].map((o) => (
          <div key={o} className="text-center text-xs">
            <Companion mood="idle" outfitId={o} size={100} />
            <div>{o}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        {SPECIES.map((s) => (
          <div key={s.id} className="card p-3">
            <p className="font-medium">
              {s.name}{' '}
              <span className="text-muted text-xs">
                ({s.biome}, {s.form})
              </span>
            </p>
            <div className="flex flex-wrap items-end">
              {growths.map((g) => (
                <PlantArt key={g} species={s} growth={g} size={110} seed={0.3} />
              ))}
              <PlantArt species={s} growth={1} size={110} wilted seed={0.3} />
              <PlantArt species={s} growth={1} size={130} variant="ancient" seed={0.3} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
