import { useQuery } from '@tanstack/react-query'

import { useVocabularies } from '@/lib/learningAPI'
import { useMemo } from 'react'

const useGetTagList = (includeAll = false) => {
  const { data: vocabularies, isLoading, refetch } = useVocabularies()

  const tagsList = useMemo(() => {
    if (!vocabularies) return []
    if (includeAll) {
      return [
        { label: 'All', value: undefined },
        ...Array.from(new Set(vocabularies?.flatMap((v) => v.tags) || []))
          .filter(Boolean)
          .map((tag) => ({ label: tag, value: tag })),
      ]
    }
    return Array.from(new Set(vocabularies?.flatMap((v) => v.tags) || []))
      .filter(Boolean)
      .map((tag) => ({ label: tag, value: tag }))
  }, [vocabularies])

  return {
    tagsList: tagsList || [],
    isLoading,
    refetch,
  }
}

export default useGetTagList
