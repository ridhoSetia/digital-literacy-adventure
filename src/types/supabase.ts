export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      game_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          game_id: string
          current_scenario_index: number
          score: number
          hp: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          game_id: string
          current_scenario_index: number
          score: number
          hp: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          game_id?: string
          current_scenario_index?: number
          score?: number
          hp?: number
        }
      }
      // ... Definisi tabel lainnya tetap sama
    }
    // ...
  }
}