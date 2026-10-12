import { useRef, useState } from 'react';
import { useAppStore, selectData } from '@/app/store/appStore';
import { Button } from '@/app/ui/Button';
import { ConfirmDialog } from '@/app/ui/Dialog';
import { Section } from '@/app/ui/Field';
import {
  downloadText,
  exportFilename,
  parseImport,
  serializeExport,
  type ImportResult,
} from '@/storage/exportImport';
import { useTimerStore } from '@/features/timer/timerStore';

export function DataSection() {
  const importAll = useAppStore((s) => s.importAll);
  const resetAll = useAppStore((s) => s.resetAll);
  const sessionActive = useTimerStore((s) => Boolean(s.engine));
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ImportResult | null>(null);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const doExport = () => {
    const data = selectData(useAppStore.getState());
    downloadText(exportFilename(), serializeExport(data));
    setMessage('Backup downloaded.');
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setPending(parseImport(text));
    if (fileInput.current) fileInput.current.value = '';
  };

  const confirmImport = () => {
    if (pending?.ok) {
      importAll(pending.data);
      setMessage(
        `Imported ${pending.summary.sessions} sessions and ${pending.summary.plants} plants.`,
      );
    }
    setPending(null);
  };

  return (
    <Section
      title="Your data"
      description="Everything lives on this device. Export a backup to move to another device or browser."
    >
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={doExport}>
          Export backup (JSON)
        </Button>
        <Button
          variant="secondary"
          onClick={() => fileInput.current?.click()}
          disabled={sessionActive}
        >
          Import backup
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a Grove backup file"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <Button variant="danger" onClick={() => setResetting(true)} disabled={sessionActive}>
          Reset everything
        </Button>
      </div>
      {sessionActive && (
        <p className="text-muted text-xs">
          Finish the running session before importing or resetting.
        </p>
      )}
      {message && (
        <p className="text-sm" role="status">
          {message}
        </p>
      )}

      <ConfirmDialog
        open={pending !== null && pending.ok}
        title="Replace everything on this device?"
        confirmLabel="Import and replace"
        danger
        onCancel={() => setPending(null)}
        onConfirm={confirmImport}
      >
        {pending?.ok && (
          <ul className="list-disc pl-5">
            <li>{pending.summary.sessions} sessions</li>
            <li>{pending.summary.plants} plants</li>
            <li>{pending.summary.tags} tags</li>
            <li>{pending.summary.dew} dew</li>
            {pending.summary.exportedAt && (
              <li>exported {new Date(pending.summary.exportedAt).toLocaleString()}</li>
            )}
          </ul>
        )}
        <p className="mt-2">
          Your current data on this device will be overwritten. Export a backup first if you want to
          keep it.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={pending !== null && !pending.ok}
        title="That file cannot be imported"
        confirmLabel="OK"
        cancelLabel="Close"
        onCancel={() => setPending(null)}
        onConfirm={() => setPending(null)}
      >
        {pending && !pending.ok && (
          <ul className="list-disc pl-5" aria-label="Problems found">
            {pending.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={resetting}
        title="Delete all Grove data on this device?"
        confirmLabel="Delete everything"
        danger
        onCancel={() => setResetting(false)}
        onConfirm={() => {
          resetAll();
          setResetting(false);
          setMessage('All data deleted.');
        }}
      >
        Sessions, plants, dew, tags and settings will be removed. This cannot be undone.
      </ConfirmDialog>
    </Section>
  );
}
