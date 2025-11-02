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
  return useQuery({
    queryKey: ['vocabularies', userId],
    queryFn: () => getAllVocabularies(userId),
    enabled: !!userId, // Only execute query when userId exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
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
    onSuccess: () => {
      showToast('Updated successfully ✅')
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] })
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
