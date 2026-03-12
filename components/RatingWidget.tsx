'use client';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export default function RatingWidget({ value, onChange, readonly }: Props) {
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="rating-widget">
      {stars.map(n => (
        <button
          key={n}
          className={`rating-star${n <= value ? ' active' : ''}`}
          onClick={() => !readonly && onChange?.(n)}
          aria-label={`Rate ${n}`}
          type="button"
        >
          ★
        </button>
      ))}
      <span className="rating-value">{value ? value : '—'}/10</span>
    </div>
  );
}
