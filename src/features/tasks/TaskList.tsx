import { useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { Button } from '@/app/ui/Button';
import { inputClass } from '@/app/ui/Field';
import { IconClose } from '@/app/ui/icons';

interface Props {
  /** Session the ticked tasks are linked to (null outside a session). */
  sessionId: string | null;
  compact?: boolean;
  className?: string;
}

/** A tiny to-do list: add, tick, delete. No projects, no due dates. */
export function TaskList({ sessionId, compact = false, className = '' }: Props) {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const clearDone = useAppStore((s) => s.clearDoneTasks);
  const [text, setText] = useState('');
  const done = tasks.filter((t) => t.done);
  // During a session, keep tasks ticked in this session visible (struck through) for the win.
  const shown = compact
    ? tasks.filter((t) => !t.done || (sessionId && t.sessionId === sessionId))
    : tasks;
  const add = () => {
    if (text.trim()) {
      addTask(text);
      setText('');
    }
  };

  return (
    <div className={className}>
      <ul className="flex flex-col gap-1" aria-label="Tasks">
        {shown.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              id={`task-${t.id}`}
              type="checkbox"
              className="h-5 w-5 accent-moss-700"
              checked={t.done}
              onChange={() => toggleTask(t.id, sessionId)}
            />
            <label
              htmlFor={`task-${t.id}`}
              className={`flex-1 text-sm ${t.done ? 'text-muted line-through' : ''}`}
            >
              {t.text}
            </label>
            {!compact && (
              <button
                type="button"
                onClick={() => deleteTask(t.id)}
                aria-label={`Delete task ${t.text}`}
                className="focus-ring rounded-full p-1 text-moss-700 hover:bg-moss-100 dark:text-moss-200 dark:hover:bg-moss-800"
              >
                <IconClose width={16} height={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="text-muted text-xs">
          {compact ? 'No open tasks.' : 'Nothing here yet. Add something small.'}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a task"
          aria-label="New task"
          maxLength={120}
          className={`${inputClass} py-1.5 text-sm`}
        />
        <Button type="button" size="sm" variant="secondary" disabled={!text.trim()} onClick={add}>
          Add
        </Button>
      </div>
      {!compact && done.length > 0 && (
        <Button size="sm" variant="ghost" className="mt-1" onClick={clearDone}>
          Clear {done.length} done
        </Button>
      )}
    </div>
  );
}
