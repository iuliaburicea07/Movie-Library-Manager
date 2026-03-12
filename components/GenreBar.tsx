'use client';

import { Genre } from '@/types';

interface Props {
  genres: Genre[];
  active: number;
  onChange: (id: number) => void;
}

export default function GenreBar({ genres, active, onChange }: Props) {
  return (
    <div className="genre-bar">
      <div className="genre-bar-inner">
        {genres.map(g => (
          <button
            key={g.id}
            className={`genre-pill${active === g.id ? ' active' : ''}`}
            onClick={() => onChange(g.id)}
            type="button"
          >
            {g.name}
          </button>
        ))}
      </div>
    </div>
  );
}
