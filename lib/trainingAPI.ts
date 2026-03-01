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
import type { TrainingDataType } from '@/components/training/type'

// Cross-platform Toast function
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  } else {
    // iOS and Web use console.log
    console.log(message)
  }
}

const sortTrainingByDateDesc = (items: TrainingDataType[]) => {
  const toMs = (dateString: string) => {
    const ms = new Date(dateString).getTime()
    // Put invalid / missing dates at the bottom when sorting desc
    return Number.isFinite(ms) ? ms : Number.NEGATIVE_INFINITY
  }

  return [...items].sort((a, b) => toMs(b.date) - toMs(a.date))
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
    getCacheItem<TrainingDataType[]>(cacheKey).then((cached) => {
      if (!isMounted) return
      if (cached) {
        queryClient.setQueryData(['training', userId], sortTrainingByDateDesc(cached))
      }
      setIsHydrated(true)
    })

    return () => {
      isMounted = false
    }
  }, [cacheKey, queryClient, userId])

  const query = useQuery<TrainingDataType[]>({
    queryKey: ['training', userId],
    queryFn: async () => {
      const data = (await getTraining(userId)) as TrainingDataType[]
      return sortTrainingByDateDesc(data)
    },
    enabled: !!userId && isHydrated, // Only execute query when userId exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 * 365,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  React.useEffect(() => {
    if (!cacheKey) return
    if (!query.data) return
    setCacheItem(cacheKey, query.data)
  }, [cacheKey, query.data])

  return query
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
        const next = old.map((item) => (item?.$id === updated.$id ? updated : item))
        return sortTrainingByDateDesc(next as TrainingDataType[])
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
