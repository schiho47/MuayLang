import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTraining,
  deleteTraining,
  getTraining,
  getTrainingById,
  updateTraining,
} from './traningAppwrite'
import { Platform, ToastAndroid } from 'react-native'

// 跨平台 Toast 函數
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    // iOS 和 Web 使用 console.log
    console.log(message)
  }
}

export const useTraining = (userId?: string) => {
  return useQuery({
    queryKey: ['training', userId],
    queryFn: () => getTraining(userId),
    enabled: !!userId, // 只有在有 userId 時才執行查詢
    retry: false, // 不要自動重試，避免多次失敗請求
  })
}

export const useCreateTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      showToast('Saved successfully ✅')
      // 重新獲取 training 資料
      queryClient.invalidateQueries({ queryKey: ['training'] })
    },
    onError: (error) => {
      console.error('CreateTraining failed', error)
      showToast('Failed to save ❌')
    },
  })
}

export const useUpdateTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { id: string; [key: string]: any }) => {
      const { id, ...data } = params
      console.log({ params })
      return updateTraining(id, data)
    },
    onSuccess: () => {
      showToast('Updated successfully ✅')
      queryClient.invalidateQueries({ queryKey: ['training'] })
    },
    onError: (error) => {
      console.error('UpdateTraining failed', error)
      showToast('Failed to update ❌')
    },
  })
}

export const useGetTrainingById = (id: string) => {
  return useQuery({
    queryKey: ['training', id],
    queryFn: () => getTrainingById(id),
    enabled: !!id, // 只有在有 id 時才執行查詢
    retry: false, // 不要自動重試，避免多次失敗請求
  })
}

export const useDeleteTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      showToast('Deleted successfully ✅')
      queryClient.invalidateQueries({ queryKey: ['training'] })
    },
    onError: (error) => {
      console.error('DeleteTraining failed', error)
      showToast('Failed to delete ❌')
    },
  })
}
