export type PlaceLookupResult = {
  placeId?: string
  mapsUrl: string
  formattedAddress?: string
  lat?: number
  lng?: number
}

/**
 * 用店名（可選地址）→ 取得 Google Maps 精準連結
 * 原理：打 Places Text Search 拿 place_id，再組 query_place_id 連結
 *
 * ⚠️ 注意：在純前端曝光 Google API Key 有風險，建議最終改走你自己的 proxy（serverless）。
 */
export async function getPlaceMapsUrl(
  name: string,
  opts?: {
    address?: string
    apiKey: string
    language?: string // ex: 'th', 'en', 'zh-TW'
    region?: string // ex: 'th', 'jp', 'tw'
    timeoutMs?: number
  }
): Promise<PlaceLookupResult> {
  if (!name?.trim()) {
    throw new Error('Place name is required')
  }
  const { address, apiKey, language = 'en', region, timeoutMs = 8000 } = opts || ({} as any)

  const query = address ? `${name}, ${address}` : name

  // Timeout 控制（避免卡死）
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', query)
    url.searchParams.set('key', apiKey)
    url.searchParams.set('language', language)
    if (region) url.searchParams.set('region', region)

    const res = await fetch(url.toString(), { signal: controller.signal })
    const data = await res.json()

    if (data.status !== 'OK' || !data.results?.length) {
      // 拿不到 place_id，就回傳一般搜尋 URL（退而求其次）
      return {
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      }
    }

    const top = data.results[0]
    const placeId: string | undefined = top.place_id
    const lat: number | undefined = top.geometry?.location?.lat
    const lng: number | undefined = top.geometry?.location?.lng
    const formattedAddress: string | undefined = top.formatted_address

    if (!placeId) {
      return {
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        formattedAddress,
        lat,
        lng,
      }
    }

    // 精準：query + query_place_id（官方建議）
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`

    return { placeId, mapsUrl, formattedAddress, lat, lng }
  } catch (e) {
    // 發生錯誤就用一般搜尋 URL 當備援
    return {
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    }
  } finally {
    clearTimeout(t)
  }
}
