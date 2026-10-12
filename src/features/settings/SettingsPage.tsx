import { useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { Section, Row, Toggle, inputClass } from '@/app/ui/Field';
import { Button } from '@/app/ui/Button';
import { DataSection } from './DataSection';
import { TagsSection } from './TagsSection';
import {
  notificationPermission,
  requestNotificationPermission,
  WakeLock,
} from '@/features/timer/platform';
import type { ThemePreference } from '@/types';

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const update = useAppStore((s) => s.updateSettings);
  const [perm, setPerm] = useState(notificationPermission());
  const pomo = settings.pomodoro;
  const setPomo = (patch: Partial<typeof pomo>) => update({ pomodoro: { ...pomo, ...patch } });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>

      <Section title="Companion">
        <Row label="Name" htmlFor="companion-name">
          <input
            id="companion-name"
            className={inputClass}
            value={settings.companionName}
            maxLength={20}
            onChange={(e) => update({ companionName: e.target.value || 'Pip' })}
          />
        </Row>
      </Section>

      <Section title="Goals">
        <Row
          label="Daily goal"
          hint="Minutes of completed focus per day. Streaks count days that hit the goal."
          htmlFor="daily-goal"
        >
          <input
            id="daily-goal"
            type="number"
            min={10}
            max={720}
            step={5}
            className={inputClass}
            value={settings.dailyGoalMinutes}
            onChange={(e) =>
              update({
                dailyGoalMinutes: Math.max(10, Math.min(720, Number(e.target.value) || 60)),
              })
            }
          />
        </Row>
      </Section>

      <Section title="Pomodoro">
        <Row label="Focus (minutes)" htmlFor="pomo-focus">
          <input
            id="pomo-focus"
            type="number"
            min={10}
            max={90}
            step={5}
            className={inputClass}
            value={pomo.focusMinutes}
            onChange={(e) => setPomo({ focusMinutes: clamp(e.target.value, 10, 90, 25) })}
          />
        </Row>
        <Row label="Short break" htmlFor="pomo-short">
          <input
            id="pomo-short"
            type="number"
            min={1}
            max={30}
            className={inputClass}
            value={pomo.shortBreakMinutes}
            onChange={(e) => setPomo({ shortBreakMinutes: clamp(e.target.value, 1, 30, 5) })}
          />
        </Row>
        <Row label="Long break" htmlFor="pomo-long">
          <input
            id="pomo-long"
            type="number"
            min={5}
            max={60}
            className={inputClass}
            value={pomo.longBreakMinutes}
            onChange={(e) => setPomo({ longBreakMinutes: clamp(e.target.value, 5, 60, 15) })}
          />
        </Row>
        <Row label="Rounds before a long break" htmlFor="pomo-rounds">
          <input
            id="pomo-rounds"
            type="number"
            min={2}
            max={8}
            className={inputClass}
            value={pomo.roundsBeforeLongBreak}
            onChange={(e) => setPomo({ roundsBeforeLongBreak: clamp(e.target.value, 2, 8, 4) })}
          />
        </Row>
      </Section>

      <Section title="Appearance">
        <Row label="Theme" htmlFor="theme">
          <select
            id="theme"
            className={inputClass}
            value={settings.theme}
            onChange={(e) => update({ theme: e.target.value as ThemePreference })}
          >
            <option value="system">Follow system</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Row>
        <Row
          label="Seasons in the garden"
          hint="Tint the garden by the calendar."
          htmlFor="seasons"
        >
          <Toggle
            id="seasons"
            checked={settings.seasons}
            onChange={(v) => update({ seasons: v })}
            label="Seasons in the garden"
          />
        </Row>
      </Section>

      <Section title="During sessions">
        <Row
          label="Notifications"
          hint={
            perm === 'granted'
              ? 'Allowed. You will be reminded when you leave.'
              : perm === 'denied'
                ? 'Blocked in the browser. Allow them in site settings.'
                : perm === 'unsupported'
                  ? 'Not supported in this browser.'
                  : 'Needed for the "come back" reminder.'
          }
          htmlFor="notif"
        >
          {perm === 'default' ? (
            <Button
              id="notif"
              size="sm"
              variant="secondary"
              onClick={() => void requestNotificationPermission().then(setPerm)}
            >
              Allow notifications
            </Button>
          ) : (
            <Toggle
              id="notif"
              checked={settings.notifications && perm === 'granted'}
              onChange={(v) => update({ notifications: v })}
              label="Notifications"
            />
          )}
        </Row>
        <Row
          label="Keep the screen awake"
          hint={
            WakeLock.supported()
              ? 'Uses the Wake Lock API while a session runs.'
              : 'Not supported in this browser.'
          }
          htmlFor="wake"
        >
          <Toggle
            id="wake"
            checked={settings.wakeLock}
            onChange={(v) => update({ wakeLock: v })}
            label="Keep the screen awake"
          />
        </Row>
        <Row label="Vibration" htmlFor="haptics">
          <Toggle
            id="haptics"
            checked={settings.haptics}
            onChange={(v) => update({ haptics: v })}
            label="Vibration"
          />
        </Row>
        <Row label="Completion chime" htmlFor="chime">
          <Toggle
            id="chime"
            checked={settings.chime}
            onChange={(v) => update({ chime: v })}
            label="Completion chime"
          />
        </Row>
      </Section>

      <TagsSection />
      <DataSection />

      <Section title="About">
        <p className="text-sm">
          Grove is free, has no ads, no accounts and no tracking. Nothing leaves your device unless
          you export it. A web app cannot block other apps; instead Grove notices when you leave and
          gives you a short grace period.
        </p>
        <p className="text-muted text-xs">Version {__APP_VERSION__}</p>
      </Section>
    </div>
  );
}

function clamp(v: string, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}
