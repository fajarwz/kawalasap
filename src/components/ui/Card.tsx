import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = '',
}: CardProps) {
  return (
    <section
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
          <div className="min-w-0">
            <h2 className="text-heading-16">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-copy-13 text-[var(--muted)]">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={`px-4 py-3.5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
