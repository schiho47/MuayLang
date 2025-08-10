import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTraining,
  deleteTraining,
  getTraining,
  getTrainingById,
  updateTraining,
} from './traningAppwrite'
import { ToastAndroid } from 'react-native'

export const useTraining = () => {
  return useQuery({
    queryKey: ['training'],
    queryFn: () => getTraining(),
  })
}

export const useCreateTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      ToastAndroid.show('Saved successfully ✅', ToastAndroid.SHORT)
      // 重新獲取 training 資料
      queryClient.invalidateQueries({ queryKey: ['training'] })
    },
    onError: (error) => {
      console.error('CreateTraining failed', error)
      ToastAndroid.show('Failed to save ❌', ToastAndroid.SHORT)
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
      ToastAndroid.show('Updated successfully ✅', ToastAndroid.SHORT)
      queryClient.invalidateQueries({ queryKey: ['training'] })
    },
    onError: (error) => {
      console.error('UpdateTraining failed', error)
      ToastAndroid.show('Failed to update ❌', ToastAndroid.SHORT)
    },
  })
}

export const useGetTrainingById = (id: string) => {
  return useQuery({
    queryKey: ['training', id],
    queryFn: () => getTrainingById(id),
  })
}

export const useDeleteTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      ToastAndroid.show('Deleted successfully ✅', ToastAndroid.SHORT)
      queryClient.invalidateQueries({ queryKey: ['training'] })
    },
    onError: (error) => {
      console.error('DeleteTraining failed', error)
      ToastAndroid.show('Failed to delete ❌', ToastAndroid.SHORT)
    },
  })
}
