export type PlaceLookupResult = {
  placeId?: string
  mapsUrl: string
  formattedAddress?: string
  lat?: number
  lng?: number
}

/**
 * Get precise Google Maps link using place name (optional address)
 * Method: Call Places Text Search to get place_id, then construct query_place_id link
 *
 * ⚠️ Warning: Exposing Google API Key in frontend has risks, recommend using your own proxy (serverless).
 */
export async function getPlaceMapsUrl(
  name: string,
  opts?: {
    address?: string
    apiKey: string
    language?: string // ex: 'th', 'en', 'zh-TW'
    region?: string // ex: 'th', 'jp', 'tw'
    timeoutMs?: number
  },
): Promise<PlaceLookupResult> {
  if (!name?.trim()) {
    throw new Error('Place name is required')
  }
  const { address, apiKey, language = 'en', region, timeoutMs = 8000 } = opts || ({} as any)

  const query = address ? `${name}, ${address}` : name

  // Timeout control (prevent hanging)
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
      // Can't get place_id, return general search URL as fallback
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

    // Precise: query + query_place_id (official recommendation)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`

    return { placeId, mapsUrl, formattedAddress, lat, lng }
  } catch (e) {
    // Use general search URL as fallback if error occurs
    return {
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    }
  } finally {
    clearTimeout(t)
  }
}
