import { useQuery, } from '@tanstack/react-query'

import { getDiscovery } from './discoveryAppwrite'



export const useDiscovery = (id?: string) => {
  return useQuery({
    queryKey: ['discovery', id],
    queryFn: () => getDiscovery(id),
    enabled: !!id, // Only execute query when date exists
    retry: false, // Don't auto-retry to avoid multiple failed requests
    staleTime: Infinity, // Treat as immutable for this date
    gcTime: 1000 * 60 * 60 * 24 * 365, // Keep cache for 1 year
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}




