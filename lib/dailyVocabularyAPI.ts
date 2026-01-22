import { useQuery } from '@tanstack/react-query'

import { getDailyVocabulary, getQuizDateData } from './dailyVocabulary'

export type DailyVocabularyWord = {
  th: string
  roman: string
  word: string
  tw_h: string
  tw_r: string
  ex_th: string
  ex_tw: string
  ex_en: string
}

export type DailyVocabularyDataType = {
  id: string
  topic: string
  tags: string
  words: DailyVocabularyWord[]
}

export const useDailyVocabulary = (id?: string) => {
  return useQuery<DailyVocabularyDataType | null>({
    queryKey: ['dailyVocabulary', id],
    queryFn: () => getDailyVocabulary(id) as Promise<DailyVocabularyDataType | null>,
    enabled: !!id, // Only execute query when date exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
    staleTime: Infinity, // Treat as immutable for this date
    gcTime: 1000 * 60 * 60 * 24 * 365, // Keep cache for 1 year
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useQuizDateData = (id: string[]) => {
  return useQuery<unknown[] | null>({
    queryKey: ['quizDateData', id],
    queryFn: () => getQuizDateData(id) as Promise<unknown[] | null>,
    enabled: id.length > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 365,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
