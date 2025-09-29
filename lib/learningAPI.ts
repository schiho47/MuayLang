import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { ToastAndroid } from 'react-native'
import { FilterDataType } from '../components/learning/type'
import {
  createVocabulary,
  getAllVocabularies,
  getVocabularyByFilter,
  getVocabularyById,
  updateVocabulary,
} from './learningAppwrite'

export const useVocabularies = () => {
  return useQuery({
    queryKey: ['vocabularies'],
    queryFn: getAllVocabularies,
  })
}

export const useAddVocabulary = (options?: { onSettled?: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVocabulary,
    onSuccess: () => {
      ToastAndroid.show('Saved successfully ✅', ToastAndroid.SHORT)
      // 更新 vocabularies cache，讓列表自動刷新
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] })
    },
    onError: (error) => {
      console.error('CreateVocabulary failed', error)
      ToastAndroid.show('Failed to save ❌', ToastAndroid.SHORT)
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
      ToastAndroid.show('Updated successfully ✅', ToastAndroid.SHORT)
      queryClient.invalidateQueries({ queryKey: ['vocabularies'] })
    },
    onError: (error) => {
      console.error('UpdateVocabulary failed', error)
      ToastAndroid.show('Failed to update ❌', ToastAndroid.SHORT)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useGetVocabularyById = (
  id: string,
  options?: { enabled?: boolean; select?: (data: any) => any }
) => {
  return useQuery({
    queryKey: ['vocabulary', id],
    queryFn: () => getVocabularyById(id),
    enabled: options?.enabled ?? false,
    select: options?.select,
  })
}
// 這裡做到filter 回來會是空白tag沒辦法被過濾
export const useGetVocabularyByFilter = (
  filter: FilterDataType,
  options?: { onSettled?: () => void }
) => {
  const query = useQuery({
    queryKey: ['vocabulary', filter],
    queryFn: () => getVocabularyByFilter(filter),
    enabled: false,
  })

  // 使用 useEffect 來處理 onSettled
  React.useEffect(() => {
    if (query.isSuccess || query.isError) {
      options?.onSettled?.()
    }
  }, [query.isSuccess, query.isError, options])

  return query
}
