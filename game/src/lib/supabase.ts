import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export interface GameRecord {
  winner_name: string
  loser_name: string
  grade: number
  semester: string
  duration_s: number | null
  winner_pos: number
  loser_pos: number | null
}

export async function saveGameRecord(record: GameRecord) {
  const { error } = await supabase.from('game_records').insert(record)
  if (error) console.warn('[supabase] 写入失败:', error.message)
}
