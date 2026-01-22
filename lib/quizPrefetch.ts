import type { QuizQuestion } from '@/hooks/useGetQuizQuestion'
import type { DailyVocabularyWord } from '@/lib/dailyVocabularyAPI'

export type QuizDateWord = DailyVocabularyWord & {
  dayId?: string
  tags?: string
  id?: string
}

type PrefetchPayload = {
  pool: QuizDateWord[]
  firstQuestion: QuizQuestion | null
}

let prefetched: PrefetchPayload | null = null

export const setPrefetchedQuiz = (payload: PrefetchPayload) => {
  prefetched = payload
}

export const consumePrefetchedQuiz = (): PrefetchPayload | null => {
  const value = prefetched
  prefetched = null
  return value
}
