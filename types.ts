
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
}

export interface SongInfo {
  id: string;
  name: string;
  artist: string;
  info: string;
  report: string;
  genre: string;
  confidence: number;
  timestamp: number;
}

export enum AppState {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  SEARCH_TEXT = 'SEARCH_TEXT',
  SEARCH_FILTERS = 'SEARCH_FILTERS',
  RESULTS = 'RESULTS',
  LIBRARY = 'LIBRARY',
  PROFILE = 'PROFILE'
}

export interface SearchFilters {
  genre?: string;
  vocalType?: string;
  era?: string;
  origin?: string;
  context?: string;
}

export interface IdentifyCandidate {
  name: string;
  artist: string;
  info: string;
  genre: string;
  report: string;
  confidence: number;
}
