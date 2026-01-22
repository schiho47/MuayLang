import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTraining,
  deleteTraining,
  getTraining,
  getTrainingById,
  updateTraining,
} from './traningAppwrite'
import { Platform, ToastAndroid } from 'react-native'
import React from 'react'
import { getCacheItem, setCacheItem } from './cacheStorage'

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
  const queryClient = useQueryClient()
  const [isHydrated, setIsHydrated] = React.useState(false)
  const cacheKey = userId ? `cache:training:${userId}` : ''

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
        queryClient.setQueryData(['training', userId], cached)
      }
      setIsHydrated(true)
    })

    return () => {
      isMounted = false
    }
  }, [cacheKey, queryClient, userId])

  return useQuery({
    queryKey: ['training', userId],
    queryFn: () => getTraining(userId),
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
    onSuccess: (result) => {
      showToast('Updated successfully ✅')
      const updated = result?.data
      queryClient.setQueriesData({ queryKey: ['training'] }, (old: any) => {
        if (!Array.isArray(old) || !updated?.$id) return old
        return old.map((item) => (item?.$id === updated.$id ? updated : item))
      })

      queryClient.getQueriesData({ queryKey: ['training'] }).forEach(([key, data]) => {
        const userId = Array.isArray(key) ? key[1] : undefined
        if (userId && Array.isArray(data)) {
          setCacheItem(`cache:training:${userId}`, data)
        }
      })
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
