import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTraining,
  deleteTraining,
  getTraining,
  getTrainingById,
  updateTraining,
} from './traningAppwrite'
import { Platform, ToastAndroid } from 'react-native'

// Cross-platform Toast function
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    // iOS and Web use console.log
    console.log(message)
  }
}

export const useTraining = (userId?: string) => {
  return useQuery({
    queryKey: ['training', userId],
    queryFn: () => getTraining(userId),
    enabled: !!userId, // Only execute query when userId exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
  })
}

export const useCreateTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      showToast('Saved successfully ✅')
      // Refetch training data
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
    enabled: !!id, // Only execute query when id exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
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
