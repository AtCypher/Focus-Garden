import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/app/store/appStore';
import { useUiStore } from '@/app/store/uiStore';
import { Button } from '@/app/ui/Button';
import { TOUR_STEPS } from './steps';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * A guided tour with a spotlight: it navigates between pages, highlights the element whose
 * `data-tour` matches the step, and shows a card with the explanation. Runs once after onboarding
 * and whenever Settings asks for it.
 */
export function Tour() {
  const tutorialDone = useAppStore((s) => s.settings.tutorialDone);
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);
  const update = useAppStore((s) => s.updateSettings);
  const replay = useUiStore((s) => s.tourRequested);
  const setReplay = useUiStore((s) => s.setTourRequested);
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const active = onboardingDone && (replay || !tutorialDone);
  const current = TOUR_STEPS[step];

  const finish = useCallback(() => {
    setReplay(false);
    setStep(0);
    update({ tutorialDone: true });
  }, [setReplay, update]);

  // Go to the step's page.
  useEffect(() => {
    if (!active) return;
    if (location.pathname !== current.route) navigate(current.route);
  }, [active, current.route, location.pathname, navigate]);

  // Measure the target (after the page rendered) and keep it measured on resize/scroll.
  useLayoutEffect(() => {
    if (!active) return;
    let raf = 0;
    const measure = () => {
      const el = current.target
        ? document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`)
        : null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const el = current.target
      ? document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`)
      : null;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const t = setTimeout(measure, 350);
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [active, step, current.target, location.pathname]);

  useEffect(() => {
    if (active) cardRef.current?.focus();
  }, [active, step]);

  if (!active) return null;
  const pad = 8;
  const last = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      {/* Spotlight: a hole over the target made with a huge box-shadow. Taps go through nothing. */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-dew-500 transition-all duration-300"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(10, 20, 14, 0.55)',
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-[rgba(10,20,14,0.55)]" />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className="card focus-ring absolute inset-x-3 bottom-24 mx-auto max-w-md p-4 shadow-xl md:bottom-6"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <p className="text-muted text-xs">
          Step {step + 1} of {TOUR_STEPS.length}
        </p>
        <h2 id="tour-title" className="font-display mt-0.5 text-xl font-semibold">
          {current.title}
        </h2>
        <p className="mt-1 text-sm">{current.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            Skip tour
          </Button>
          <span className="flex gap-2">
            {step > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={() => (last ? finish() : setStep(step + 1))}>
              {last ? 'Start growing' : 'Next'}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
}
