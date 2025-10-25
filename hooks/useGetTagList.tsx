import { useVocabularies } from '@/lib/learningAPI'
import { useMemo, useState, useCallback } from 'react'
import { useUser } from './useUser'

const useGetTagList = (includeAll = false) => {
  const { user } = useUser()
  const { data: vocabularies, isLoading, refetch } = useVocabularies(user?.$id)

  // 本地儲存新新增的 tag
  const [localTags, setLocalTags] = useState<string[]>([])

  const tagsList = useMemo(() => {
    if (!vocabularies) return []

    // 從資料庫獲取的 tag
    const dbTags = Array.from(new Set(vocabularies?.flatMap((v) => v.tags) || [])).filter(Boolean)

    // 合併資料庫 tag 和本地新新增的 tag
    const allTags = Array.from(new Set([...dbTags, ...localTags]))

    if (includeAll) {
      return [
        { label: 'All', value: undefined },
        ...allTags.map((tag) => ({ label: tag, value: tag })),
      ]
    }
    return allTags.map((tag) => ({ label: tag, value: tag }))
  }, [vocabularies, localTags, includeAll])

  // 新增新 tag 到本地列表的函數
  const addLocalTag = useCallback(
    (tag: string) => {
      if (tag && !localTags.includes(tag)) {
        setLocalTags((prev) => [...prev, tag])
      }
    },
    [localTags],
  )

  // 清除本地 tag（在儲存成功後呼叫）
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
