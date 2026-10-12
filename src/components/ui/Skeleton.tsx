/**
 * A loading placeholder. Skeletons keep the page's shape while data is on its
 * way, so nothing jumps when it arrives.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-sm bg-[var(--surface-2)] ${className}`}
    />
  );
}
