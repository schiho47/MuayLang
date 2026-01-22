import { useState, useCallback } from 'react'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY })

export interface QuizQuestion {
  question: string
  phonetic: string
  options: string[]
  answerIndex: number
  cultural_note: string
  encouragement: string
}

export const useGetQuizQuestion = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestion = useCallback(
    async (dateObject: {
      dateId: string
      tags: string
      ex_en: string
      ex_th: string
      ex_tw: string
      roman: string
      th: string
      tw_h: string
      tw_r: string
      word: string
    }): Promise<QuizQuestion | null> => {
      setLoading(true)
      setError(null)
      console.log('dateObject', dateObject)
      const prompt = `
      You are an expert Thai educator.
      Current context:
      - Topic: "${dateObject.tags}"
      - Current word: "${dateObject.th}" (Meaning: ${dateObject.word})
      

      Generate a quiz for "${dateObject.th}".
      
      Requirements:
      1. "options": 4 English meanings (One correct) with random order.
      2. "cultural_note":
         *Must mention the topic "${dateObject.dateId}" or "${dateObject.tags}" or comparing related Thai words, or sharing relevant cultural insights if applicable.*
        
      3.  Respond ONLY in JSON:
      {
        "question": "${dateObject.th}",
        "phonetic": "${dateObject.roman}",
        "options": ["...", "...", "...", "..."],
        "answerIndex": 0,
        "cultural_note": "...",

      }
    `

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.8, // 稍微提高溫度，讓台語口吻更生動
          },
        })
console.log('response', response)
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) throw new Error('Empty response')

        return JSON.parse(text) as QuizQuestion
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

  return { fetchQuestion, loading, error }
}
