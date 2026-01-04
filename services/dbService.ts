
import { UserProfile, SongInfo } from "../types";

// Simulação de um banco de dados persistente
export const dbService = {
  async getUser(): Promise<UserProfile | null> {
    const data = localStorage.getItem('soundnote_db_user');
    return data ? JSON.parse(data) : null;
  },

  async saveUser(user: UserProfile): Promise<void> {
    localStorage.setItem('soundnote_db_user', JSON.stringify(user));
  },

  async getLibrary(): Promise<SongInfo[]> {
    const data = localStorage.getItem('soundnote_db_library');
    return data ? JSON.parse(data) : [];
  },

  async saveLibrary(library: SongInfo[]): Promise<void> {
    localStorage.setItem('soundnote_db_library', JSON.stringify(library));
  },

  async clearAll(): Promise<void> {
    localStorage.removeItem('soundnote_db_user');
    localStorage.removeItem('soundnote_db_library');
  }
};
