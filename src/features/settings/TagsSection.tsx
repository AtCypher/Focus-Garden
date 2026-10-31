import { useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { Button } from '@/app/ui/Button';
import { Section, NumberField, inputClass } from '@/app/ui/Field';
import { IconClose } from '@/app/ui/icons';

const COLORS = [
  '#3ea6cd',
  '#5b8c48',
  '#e4779f',
  '#e9b23c',
  '#8d8ac2',
  '#e8553f',
  '#7fa6b8',
  '#a7764a',
];

export function TagsSection() {
  const tags = useAppStore((s) => s.tags);
  const addTag = useAppStore((s) => s.addTag);
  const updateTag = useAppStore((s) => s.updateTag);
  const deleteTag = useAppStore((s) => s.deleteTag);
  const goals = useAppStore((s) => s.progress.tagGoals);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  return (
    <Section
      title="Tags"
      description="Label sessions (Study, Work, Reading…) to filter your stats. The number is a weekly goal in minutes (0 for none)."
    >
      <ul className="flex flex-col gap-2">
        {tags.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="color"
              value={t.color}
              onChange={(e) => updateTag(t.id, { color: e.target.value })}
              aria-label={`Colour for ${t.name}`}
              className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            />
            <input
              value={t.name}
              onChange={(e) => updateTag(t.id, { name: e.target.value })}
              aria-label={`Rename tag ${t.name}`}
              className={inputClass}
            />
            <NumberField
              id={`goal-${t.id}`}
              value={goals[t.id] ?? 0}
              min={0}
              max={3000}
              fallback={0}
              step={15}
              onCommit={(v) => updateProgress((p) => ({ tagGoals: { ...p.tagGoals, [t.id]: v } }))}
              aria-label={`Weekly goal in minutes for ${t.name}`}
              title="Weekly goal (minutes per week, 0 = none)"
              className="w-24"
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete tag ${t.name}`}
              onClick={() => deleteTag(t.id)}
            >
              <IconClose />
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            addTag(name, color);
            setName('');
          }
        }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="New tag colour"
          className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag"
          aria-label="New tag name"
          className={inputClass}
          maxLength={24}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!name.trim()}>
          Add
        </Button>
      </form>
    </Section>
  );
}
