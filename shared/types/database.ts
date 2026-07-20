import type { DailyNew, Topic, WorkoutRecord } from './domain'

// Row は domain.ts の型をそのまま採用し、Insert/Update はそこから派生させる
// （id / created_at は DB 側で自動採番されるため省略可能にする）。
type WithOptionalAutoFields<T extends { id: string; created_at: string }> = Omit<
  T,
  'id' | 'created_at'
> &
  Partial<Pick<T, 'id' | 'created_at'>>

type DailyNewInsert = WithOptionalAutoFields<DailyNew>
type TopicInsert = WithOptionalAutoFields<Topic>
type WorkoutRecordInsert = WithOptionalAutoFields<WorkoutRecord>

export type Database = {
  public: {
    Tables: {
      daily_new: {
        Row: DailyNew
        Insert: DailyNewInsert
        Update: Partial<DailyNewInsert>
        Relationships: []
      }
      topics: {
        Row: Topic
        Insert: TopicInsert
        Update: Partial<TopicInsert>
        Relationships: []
      }
      workout_records: {
        Row: WorkoutRecord
        Insert: WorkoutRecordInsert
        Update: Partial<WorkoutRecordInsert>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
