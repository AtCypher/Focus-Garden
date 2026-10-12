import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyData, setPersistence, useAppStore, type Persistence } from './appStore';

function mockPersistence(): Persistence {
  return {
    putSession: vi.fn(async () => {}),
    putPlant: vi.fn(async () => {}),
    putPlants: vi.fn(async () => {}),
    putTag: vi.fn(async () => {}),
    deleteTag: vi.fn(async () => {}),
    putDecoration: vi.fn(async () => {}),
    deleteDecoration: vi.fn(async () => {}),
    putWallet: vi.fn(async () => {}),
    putSettings: vi.fn(async () => {}),
    putAchievements: vi.fn(async () => {}),
    putStreak: vi.fn(async () => {}),
    replaceAll: vi.fn(async () => {}),
    clearAll: vi.fn(async () => {}),
  };
}

describe('app store', () => {
  let p: Persistence;
  beforeEach(() => {
    p = mockPersistence();
    setPersistence(p);
    useAppStore.setState({ ...emptyData(), hydrated: true });
  });

  it('records a session, its plant and the dew it earned', () => {
    const s = useAppStore.getState();
    s.recordSession(
      {
        id: 's',
        startedAt: '',
        endedAt: '',
        plannedMinutes: 25,
        actualMinutes: 25,
        mode: 'countdown',
        strictness: 'standard',
        speciesId: 'daisy',
        tagId: null,
        outcome: 'completed',
        note: '',
        dewEarned: 28,
        round: null,
      },
      {
        id: 'p',
        sessionId: 's',
        speciesId: 'daisy',
        variant: 'standard',
        biome: 'meadow',
        wilted: false,
        grownAt: '',
        tile: null,
      },
    );
    expect(useAppStore.getState().sessions).toHaveLength(1);
    expect(useAppStore.getState().plants).toHaveLength(1);
    expect(useAppStore.getState().wallet.dew).toBe(28);
    expect(useAppStore.getState().wallet.totalEarned).toBe(28);
    expect(p.putSession).toHaveBeenCalledTimes(1);
    expect(p.putPlant).toHaveBeenCalledTimes(1);
    expect(p.putWallet).toHaveBeenCalledTimes(1);
  });

  it('buys species only with enough dew and never twice', () => {
    useAppStore.getState().addDew(100);
    expect(useAppStore.getState().buySpecies('poppy', 40)).toBe(true);
    expect(useAppStore.getState().wallet.dew).toBe(60);
    expect(useAppStore.getState().buySpecies('poppy', 40)).toBe(false);
    expect(useAppStore.getState().buySpecies('cherry', 150)).toBe(false);
    expect(useAppStore.getState().wallet.dew).toBe(60);
  });

  it('deleting a tag detaches it from sessions and the default', () => {
    const s = useAppStore.getState();
    const tag = s.addTag('Deep work', '#123456');
    s.updateSettings({ defaultTagId: tag.id });
    s.recordSession(
      {
        id: 's',
        startedAt: '',
        endedAt: '',
        plannedMinutes: 25,
        actualMinutes: 25,
        mode: 'countdown',
        strictness: 'standard',
        speciesId: 'daisy',
        tagId: tag.id,
        outcome: 'completed',
        note: '',
        dewEarned: 0,
        round: null,
      },
      null,
    );
    useAppStore.getState().deleteTag(tag.id);
    expect(useAppStore.getState().sessions[0].tagId).toBeNull();
    expect(useAppStore.getState().settings.defaultTagId).toBeNull();
    expect(useAppStore.getState().tags.find((t) => t.id === tag.id)).toBeUndefined();
  });

  it('places decorations only when one is owned and unplaced', () => {
    const s = useAppStore.getState();
    expect(s.placeDecoration('bench', { col: 0, row: 0 })).toBeNull();
    s.addDew(500);
    expect(useAppStore.getState().buyDecoration('bench', 100)).toBe(true);
    expect(useAppStore.getState().placeDecoration('bench', { col: 0, row: 0 })).not.toBeNull();
    expect(useAppStore.getState().placeDecoration('bench', { col: 1, row: 0 })).toBeNull();
  });
});
