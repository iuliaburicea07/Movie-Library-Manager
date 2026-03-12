export default function SkeletonCard({ grid = false }: { grid?: boolean }) {
  return (
    <div className={`skeleton-card${grid ? ' card-grid-item' : ''}`}>
      <div className="skeleton skeleton-poster" />
      <div className="skeleton-info">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  );
}
