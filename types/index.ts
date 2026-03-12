export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
}

export interface Genre {
  id: number;
  name: string;
}

export interface Season {
  id: number;
  season_number: number;
  episode_count: number;
  name: string;
}

export interface TVDetails {
  id: number;
  number_of_seasons: number;
  seasons: Season[];
}

export interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster: string | null;
  rating?: number;
  watchedAt: number;
}

export interface BlacklistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster: string | null;
  blacklistedAt: number;
}

export interface ContinueItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster: string | null;
  progress: number;
  season?: number;
  episode?: number;
  updatedAt: number;
}

export type MediaType = 'movie' | 'tv';
export type SortOption = 'popularity.desc' | 'vote_average.desc' | 'vote_count.desc' | 'release_date.desc' | 'primary_release_date.desc' | 'first_air_date.desc';
