import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { newlyEarnedSpecies, unlockContext } from './unlocks';

/** Give the user any milestone species they have now earned, with a toast. */
export function grantEarnedSpecies(): void {
  const app = useAppStore.getState();
  const ctx = unlockContext(app.sessions, app.wallet, app.streak.best);
  const earned = newlyEarnedSpecies(ctx);
  for (const s of earned) app.grantSpecies(s.id);
  if (earned.length === 1)
    useUiStore.getState().showToast(`New species unlocked: ${earned[0].name}.`);
  else if (earned.length > 1)
    useUiStore.getState().showToast(`${earned.length} new species unlocked. See the Seed Book.`);
}
