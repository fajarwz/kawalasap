import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface InfoTipProps {
  /** The term itself, also used as the button's accessible name. */
  label: string;
  /** The explanation: one or two plain sentences. */
  children: ReactNode;
}

const WIDTH = 264;

/**
 * A small info button that explains a term or a unit.
 *
 * The bubble is rendered into document.body with fixed positioning on purpose:
 * inside a table's horizontal scroll container it would otherwise be clipped.
 * It opens on hover, on focus (keyboard) and on click (touch), and closes on
 * Escape, on outside click, or as soon as the page scrolls, because a fixed
 * bubble would drift away from its icon.
 */
export function InfoTip({ label, children }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const show = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTop(rect.top - 8);
    setLeft(
      Math.min(
        Math.max(rect.left + rect.width / 2, WIDTH / 2 + 8),
        window.innerWidth - WIDTH / 2 - 8,
      ),
    );
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
        className="inline-flex shrink-0 items-center justify-center rounded-full align-middle text-[var(--faint)] hover:text-[var(--text)]"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="4.9" r="0.95" fill="currentColor" />
          <path d="M8 7.4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open
        ? createPortal(
            <span
              role="tooltip"
              id={id}
              style={{ top, left, width: WIDTH }}
              className="fixed z-[1400] block -translate-x-1/2 -translate-y-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-label-12 leading-relaxed text-[var(--muted)] shadow-[var(--shadow-overlay)]"
            >
              <span className="mb-0.5 block font-medium text-[var(--text)]">{label}</span>
              {children}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
