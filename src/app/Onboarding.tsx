import { useEffect, useRef, useState } from 'react';
import { useAppStore } from './store/appStore';
import { Button } from './ui/Button';
import { Companion } from '@/art/Companion';
import { PlantArt } from '@/art/PlantArt';
import { getSpecies } from '@/data/species';
import { inputClass } from './ui/Field';
import { notificationPermission, requestNotificationPermission } from '@/features/timer/platform';

/** Three short screens on first launch. Dismissable at any point; never shown again. */
export function Onboarding() {
  const done = useAppStore((s) => s.settings.onboardingDone);
  const update = useAppStore((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Pip');
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  if (done) return null;

  const finish = () => update({ onboardingDone: true, companionName: name.trim() || 'Pip' });

  const steps = [
    {
      title: 'Plant a seed to focus',
      body: 'Pick a plant and a length, then tap Plant. The seed grows while you work. When the timer ends, the plant joins your garden and you earn dew to spend on new species.',
      art: <PlantArt species={getSpecies('daisy')} growth={1} size={150} />,
    },
    {
      title: 'Stay, or it wilts',
      body: 'In Standard and Deep focus modes, leaving the app starts a short grace period. Come back in time and the plant lives. Gentle mode never wilts and allows pauses, and the "leaving is allowed" option keeps any mode from wilting when you lock your phone. A web app cannot block other apps, so Grove relies on you, with a reminder.',
      art: <PlantArt species={getSpecies('daisy')} growth={1} wilted size={150} />,
    },
    {
      title: 'Meet your gardener',
      body: 'This little sprite tends your plants and cheers you on. Give it a name. Everything stays on this device: no account, no ads, no tracking.',
      art: <Companion mood="happy" size={150} label="Your companion" />,
    },
  ];
  const s = steps[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-moss-50 p-4 dark:bg-moss-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
    >
      <div className="card w-full max-w-md p-6 text-center">
        <div className="flex justify-center">{s.art}</div>
        <h2
          id="onb-title"
          ref={heading}
          tabIndex={-1}
          className="font-display focus-ring mt-2 rounded text-2xl font-semibold"
        >
          {s.title}
        </h2>
        <p className="text-muted mt-2 text-sm">{s.body}</p>
        {step === 2 && (
          <div className="mt-3 text-left">
            <label htmlFor="onb-name" className="text-sm font-medium">
              Companion name
            </label>
            <input
              id="onb-name"
              className={`${inputClass} mt-1`}
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
            />
            {notificationPermission() === 'default' && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => void requestNotificationPermission()}
              >
                Allow "come back" reminders
              </Button>
            )}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={finish}>
            Skip
          </Button>
          <ol className="flex gap-1.5" aria-label={`Step ${step + 1} of 3`}>
            {steps.map((_, i) => (
              <li
                key={i}
                className={`h-2 w-2 rounded-full ${i === step ? 'bg-moss-700 dark:bg-moss-300' : 'bg-moss-200 dark:bg-moss-700'}`}
                aria-hidden
              />
            ))}
          </ol>
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={finish}>Start growing</Button>
          )}
        </div>
      </div>
    </div>
  );
}
