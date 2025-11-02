import { useQuery } from '@tanstack/react-query'
import { getLinkPreview } from 'link-preview-js'

const useLinkPreview = (url: string | null) => {
  return useQuery({
    queryKey: ['link-preview', url],
    queryFn: async () => {
      if (!url) throw new Error('No URL provided')
      return await getLinkPreview(url, {
        headers: { 'User-Agent': 'ReactNative' },
      })
    },
    enabled: !!url && /^https?:\/\//.test(url), // ✅ Only execute for valid URLs
    staleTime: 1000 * 60 * 60, // Don't refetch within one hour
  })
}
export default useLinkPreview
