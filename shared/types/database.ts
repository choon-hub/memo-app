import type { WorkoutCategory } from './domain'

export type Database = {
  public: {
    Tables: {
      daily_new: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
        }
      }
      workout_records: {
        Row: {
          id: string
          category: WorkoutCategory
          menu: string
          intensity: number
          reps: number
          created_at: string
        }
        Insert: {
          id?: string
          category: WorkoutCategory
          menu: string
          intensity: number
          reps: number
          created_at?: string
        }
        Update: {
          id?: string
          category?: WorkoutCategory
          menu?: string
          intensity?: number
          reps?: number
          created_at?: string
        }
      }
    }
  }
}
