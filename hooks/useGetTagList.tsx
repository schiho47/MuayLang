import { useVocabularies } from '@/lib/learningAPI'
import { useMemo, useState, useCallback } from 'react'
import { useUser } from './useUser'

const useGetTagList = (includeAll = false) => {
  const { user } = useUser()
  const { data: vocabularies, isLoading, refetch } = useVocabularies(user?.$id)

  // Local storage for newly added tags
  const [localTags, setLocalTags] = useState<string[]>([])

  const tagsList = useMemo(() => {
    if (!vocabularies) return []

    // Tags fetched from database
    const dbTags = Array.from(new Set(vocabularies?.flatMap((v) => v.tags) || [])).filter(Boolean)

    // Merge database tags and locally added tags
    const allTags = Array.from(new Set([...dbTags, ...localTags]))

    if (includeAll) {
      return [
        { label: 'All', value: undefined },
        ...allTags.map((tag) => ({ label: tag, value: tag })),
      ]
    }
    return allTags.map((tag) => ({ label: tag, value: tag }))
  }, [vocabularies, localTags, includeAll])

  // Function to add new tag to local list
  const addLocalTag = useCallback(
    (tag: string) => {
      if (tag && !localTags.includes(tag)) {
        setLocalTags((prev) => [...prev, tag])
      }
    },
    [localTags],
  )

  // Clear local tags (call after successful save)
  const clearLocalTags = useCallback(() => {
    setLocalTags([])
  }, [])

  return {
    tagsList: tagsList || [],
    isLoading,
    refetch,
    addLocalTag,
    clearLocalTags,
  }
}

export default useGetTagList
