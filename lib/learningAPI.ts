import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVocabulary,
  getAllVocabularies,
  getVocabularyByFilter,
  getVocabularyById,
  getVocabularyTagList,
} from './appwrite'
import { ToastAndroid } from 'react-native'
import { FilterDataType, VocabularyDataType } from '../components/learning/type'

export const useVocabularies = () => {
  return useQuery({
    queryKey: ['vocabularies'],
    queryFn: getAllVocabularies,
  })
}

export const useAddVocabulary = () => {
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
  })
}

export const useGetVocabularyById = (id: string, p0: { enabled: boolean }) => {
  return useQuery({
    queryKey: ['vocabulary', id],
    queryFn: () => getVocabularyById(id),
    enabled: p0?.enabled || false,
  })
}

export const useGetVocabularyByFilter = (filter: FilterDataType) => {
  return useQuery({
    queryKey: ['vocabulary', filter],
    queryFn: () => getVocabularyByFilter(filter),
  })
}

// export const useGetVocabularyTagList = () => {
//   return useQuery({
//     queryKey: ['vocabularyTagList'],
//     queryFn: getVocabularyTagList,
//   })
// }
