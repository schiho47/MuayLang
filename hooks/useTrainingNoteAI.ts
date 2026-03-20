import { useCallback, useState } from 'react'
import { GoogleGenAI } from '@google/genai'

export type TrainingNoteSupplement = {
  thai: string
  romanization: string
  english: string
  exampleTH: string
  exampleEN: string
  tags?: string[]
}

export type TrainingNoteAIResult = {
  topic_th: string
  topic_en: string
  feedback_th: string
  feedback_en: string
  supplements: TrainingNoteSupplement[]
}

const asString = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const hasThirdPersonPronouns = (text: string) => /\b(he|she|his|her|him)\b/i.test(text)
const forceFirstPersonEnglish = (text: string) => {
  return text
    .replace(/\bHe\b/g, 'I')
    .replace(/\bhe\b/g, 'I')
    .replace(/\bShe\b/g, 'I')
    .replace(/\bshe\b/g, 'I')
    .replace(/\bHis\b/g, 'My')
    .replace(/\bhis\b/g, 'my')
    .replace(/\bHer\b/g, 'My')
    .replace(/\bher\b/g, 'my')
    .replace(/\bHim\b/g, 'Me')
    .replace(/\bhim\b/g, 'me')
}

export const useTrainingNoteAI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (input: {
      date?: string | null
      sessionNumber?: string | null
      duration?: string | number | null
      calories?: string | number | null
      maxHeartRate?: string | number | null
      avgHeartRate?: string | number | null
      note: string
    }): Promise<TrainingNoteAIResult | null> => {
      setLoading(true)
      setError(null)
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        setError('Missing Gemini API key.')
        setLoading(false)
        return null
      }

      const ai = new GoogleGenAI({ apiKey })
      const buildPrompt = (opts?: { strictFirstPerson?: boolean }) => `
You are a Thai language coach.
Given a user's Muay Thai training record, do two things:
1) Provide a concise holistic evaluation in Thai, considering: duration, calories, max/avg heart rate, AND the written note.
   Then provide the English translation of that evaluation.
2) Generate exactly 3 Thai vocabulary supplements derived specifically from the written note (not from the numbers).

INPUT:
- date: "${input.date ?? ''}"
- sessionNumber: "${input.sessionNumber ?? ''}"
- duration_minutes: "${input.duration ?? ''}"
- calories_kcal: "${input.calories ?? ''}"
- max_heart_rate_bpm: "${input.maxHeartRate ?? ''}"
- avg_heart_rate_bpm: "${input.avgHeartRate ?? ''}"
- note: """${input.note}"""

OUTPUT JSON ONLY:
{
  "topic_th": "short topic summary in Thai",
  "topic_en": "topic summary in English",
  "feedback_th": "Thai feedback text",
  "feedback_en": "English translation of feedback_th",
  "supplements": [
    {
      "thai": "....",
      "romanization": "....",
      "english": "....",
      "exampleTH": "....",
      "exampleEN": "....",
      "tags": ["optional", "tags"]
    }
  ]
}

RULES:
- supplements length MUST be exactly 3.
- Thai must be authentic Thai script.
- romanization MUST be provided for every supplement (non-empty). Use an easy-to-read Thai romanization (no IPA required).
- Always use the key name "romanization" (not "roman", not "phonetic").
- Feedback MUST mention at least 2 of the numeric fields (duration/calories/heart rate) plus 1 specific point from the note.
- For supplements: exampleTH should be natural Thai.
- For supplements: exampleEN MUST use first-person "I/we" (NOT he/she).${opts?.strictFirstPerson ? ' STRICT: do not use any he/she/his/her/him anywhere in exampleEN.' : ''}
- Keep feedback helpful but short.
`

      try {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: buildPrompt({ strictFirstPerson: attempt > 0 }) }] }],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.6,
            },
          })
          const text = response.candidates?.[0]?.content?.parts?.[0]?.text
          if (!text) throw new Error('Empty response')
          const parsed = JSON.parse(text) as any
          if (
            !parsed?.feedback_th ||
            !parsed?.feedback_en ||
            !parsed?.topic_th ||
            !parsed?.topic_en ||
            !Array.isArray(parsed?.supplements)
          ) {
            throw new Error('Invalid JSON shape')
          }

          const supplements = (parsed.supplements as any[]).slice(0, 3).map((s) => {
            const romanization = asString(s?.romanization || s?.roman || s?.phonetic)
            const exampleENRaw = asString(s?.exampleEN)
            const exampleEN = hasThirdPersonPronouns(exampleENRaw)
              ? attempt > 0
                ? forceFirstPersonEnglish(exampleENRaw)
                : exampleENRaw
              : exampleENRaw

            return {
              thai: asString(s?.thai),
              romanization,
              english: asString(s?.english),
              exampleTH: asString(s?.exampleTH),
              exampleEN,
              tags: Array.isArray(s?.tags) ? s.tags.map(asString).filter(Boolean) : undefined,
            } satisfies TrainingNoteSupplement
          })

          if (supplements.length !== 3 || supplements.some((s) => !s.romanization.trim())) {
            throw new Error('Missing romanization')
          }

          // If still uses he/she and this is first attempt, retry with stricter prompt.
          if (attempt === 0 && supplements.some((s) => hasThirdPersonPronouns(s.exampleEN))) {
            continue
          }

          return {
            topic_th: asString(parsed.topic_th),
            topic_en: asString(parsed.topic_en),
            feedback_th: asString(parsed.feedback_th),
            feedback_en: asString(parsed.feedback_en),
            supplements,
          } satisfies TrainingNoteAIResult
        }

        return null
      } catch (err) {
        console.error('Gemini API Error:', err)
        setError('An error occurred, please try again later.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { generate, loading, error }
}

