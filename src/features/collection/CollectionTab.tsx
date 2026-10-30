import { useAppStore } from '@/app/store/appStore';
import { FINDS } from '@/data/finds';
import { VISITORS } from '@/data/visitors';
import { BIOME_BY_ID } from '@/data/biomes';
import { FindArt } from '@/art/Finds';
import { VisitorArt } from '@/art/Visitors';
import { activeEvent, EVENTS } from '@/data/events';
import { eventStatus } from './rituals';

/** Pip's shelf of finds, the wildlife seen so far, and the seasonal events. */
export function CollectionTab() {
  const progress = useAppStore((s) => s.progress);
  const name = useAppStore((s) => s.settings.companionName);
  const found = new Map(progress.finds.map((f) => [f.id, f]));
  const seen = new Map(progress.visitors.map((v) => [v.id, v]));
  const now = new Date();
  const current = activeEvent(now);
  const status = eventStatus(progress, now);

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="finds-h">
        <h2 id="finds-h" className="text-base font-semibold">
          {name}&apos;s shelf{' '}
          <span className="text-muted text-sm font-normal">
            ({found.size} of {FINDS.length})
          </span>
        </h2>
        <p className="text-muted text-xs">
          Things {name} brings back after a session, now and then.
        </p>
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {FINDS.map((f) => {
            const got = found.get(f.id);
            return (
              <li
                key={f.id}
                className={`card flex flex-col items-center p-2 text-center ${got ? '' : 'opacity-50'}`}
              >
                <FindArt id={f.id} size={44} className={got ? '' : 'grayscale'} />
                <p className="mt-1 text-xs font-medium">{got ? f.name : '???'}</p>
                {got && <p className="text-muted text-[11px] italic">{f.blurb}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="visitors-h">
        <h2 id="visitors-h" className="text-base font-semibold">
          Visitors{' '}
          <span className="text-muted text-sm font-normal">
            ({seen.size} of {VISITORS.length})
          </span>
        </h2>
        <p className="text-muted text-xs">
          Wildlife shows up as biomes recover. Open the garden to spot today&apos;s.
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {VISITORS.map((v) => {
            const got = seen.get(v.id);
            return (
              <li
                key={v.id}
                className={`card flex items-center gap-2 p-2 ${got ? '' : 'opacity-60'}`}
              >
                <svg
                  viewBox="-20 -44 40 50"
                  width="44"
                  height="54"
                  aria-hidden
                  className={got ? '' : 'grayscale'}
                >
                  <VisitorArt id={v.id} />
                </svg>
                <div className="min-w-0 text-xs">
                  <p className="font-medium">{got ? v.name : '???'}</p>
                  <p className="text-muted">
                    {BIOME_BY_ID[v.biome].name}
                    {got
                      ? ` · seen ${got.sightings}×`
                      : ` · ${Math.round(v.minRestoration * 100)}% restored${v.times ? `, ${v.times.join('/')}` : ''}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="events-h">
        <h2 id="events-h" className="text-base font-semibold">
          Seasonal events
        </h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {EVENTS.map((e) => {
            const live = current?.id === e.id;
            return (
              <li key={e.id} className={`card p-3 text-sm ${live ? 'border-sun-400' : ''}`}>
                <p className="font-medium">
                  {e.name}{' '}
                  <span className="text-muted text-xs font-normal">
                    {e.start.day}/{e.start.month} – {e.end.day}/{e.end.month}
                  </span>
                </p>
                <p className="text-muted text-xs">{e.blurb}</p>
                {live && status && (
                  <p className="mt-1 text-xs font-medium">
                    {status.claimed
                      ? 'Reward earned this year.'
                      : `${status.sessions} of ${e.sessionsNeeded} sessions done this week.`}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
