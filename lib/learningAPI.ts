import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Platform, ToastAndroid } from 'react-native'
import { FilterDataType } from '../components/learning/type'
import {
  createVocabulary,
  getAllVocabularies,
  getVocabularyByFilter,
  getVocabularyById,
  updateVocabulary,
} from './learningAppwrite'
import { getCacheItem, setCacheItem } from './cacheStorage'

// Cross-platform Toast function
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    // iOS and Web use console.log or Alert
    console.log(message)
  }
}

export const useVocabularies = (userId?: string) => {
  const queryClient = useQueryClient()
  const [isHydrated, setIsHydrated] = React.useState(false)
  const cacheKey = userId ? `cache:vocabularies:${userId}` : ''

  React.useEffect(() => {
    let isMounted = true
    if (!userId) {
      setIsHydrated(false)
      return
    }

    setIsHydrated(false)
    getCacheItem<any[]>(cacheKey).then((cached) => {
      if (!isMounted) return
      if (cached) {
        queryClient.setQueryData(['vocabularies', userId], cached)
      }
      setIsHydrated(true)
    })

    return () => {
      isMounted = false
    }
  }, [cacheKey, queryClient, userId])

  return useQuery({
    queryKey: ['vocabularies', userId],
    queryFn: () => getAllVocabularies(userId),
    enabled: !!userId && isHydrated, // Only execute query when userId exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 365,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (cacheKey) {
        setCacheItem(cacheKey, data)
      }
    },
  })
}

export const useAddVocabulary = (options?: { onSettled?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVocabulary,
    onSuccess: () => {
      showToast('Saved successfully ✅')
      // Update vocabularies cache to auto-refresh list
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] })
    },
    onError: (error) => {
      console.error('CreateVocabulary failed', error)
      showToast('Failed to save ❌')
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useUpdateVocabulary = (options?: { onSettled?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVocabulary,
    onSuccess: (updated) => {
      showToast('Updated successfully ✅')
      // Keep cache in sync without refetching
      queryClient.setQueriesData({ queryKey: ['vocabularies'] }, (old: any) => {
        if (!Array.isArray(old) || !updated?.$id) return old
        return old.map((item) => (item?.$id === updated.$id ? updated : item))
      })

      // Persist updated caches
      queryClient.getQueriesData({ queryKey: ['vocabularies'] }).forEach(([key, data]) => {
        const userId = Array.isArray(key) ? key[1] : undefined
        if (userId && Array.isArray(data)) {
          setCacheItem(`cache:vocabularies:${userId}`, data)
        }
      })
    },
    onError: (error) => {
      console.error('UpdateVocabulary failed', error)
      showToast('Failed to update ❌')
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useGetVocabularyById = (
  id: string,
  options?: { enabled?: boolean; select?: (data: any) => any },
) => {
  return useQuery({
    queryKey: ['vocabulary', id],
    queryFn: () => getVocabularyById(id),
    enabled: options?.enabled ?? false,
    select: options?.select,
  })
}
// Note: Filter may return empty tags that cannot be filtered
export const useGetVocabularyByFilter = (
  filter: FilterDataType,
  userId?: string,
  options?: { onSettled?: () => void },
) => {
  const query = useQuery({
    queryKey: ['vocabulary', filter, userId],
    queryFn: () => getVocabularyByFilter(filter, userId),
    enabled: false,
  })

  // Use useEffect to handle onSettled
  React.useEffect(() => {
    if (query.isSuccess || query.isError) {
      options?.onSettled?.()
    }
  }, [query.isSuccess, query.isError, options])

  return query
}
