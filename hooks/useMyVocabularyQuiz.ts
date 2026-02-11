import { useState, useCallback } from 'react'
import { GoogleGenAI } from '@google/genai'

export interface QuizQuestion {
  quiz_type: 'TYPE_A' | 'TYPE_B'
  question: string
  phonetic: string
  options: string[]
  answerIndex: number
  cultural_note: string
  encouragement: string
  options_display: string[]
}

export const useMyVocabularyQuiz = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchMyVocabularyQuestion = useCallback(
    async (dateObject: {
        thai: string,
        romanization: string,
        english: string,
        exampleTH: string,
        exampleEN: string,
        $id: string,
    }): Promise<QuizQuestion | null> => {
      setLoading(true)
      setError(null)
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        setError('Missing Gemini API key.')
        setLoading(false)
        return null
      }
      const ai = new GoogleGenAI({ apiKey })
      console.log('dateObject', dateObject)
      const prompt = `
Act as a Thai Language Expert and Data Engineer. Your task is to process a JSON object representing a vocabulary entry and enrich it with precise Thai tokenization and complementary Taiwanese Hokkien translations.

### INPUT DATA (use THIS data):
{
  "thai": "${dateObject.thai}",
  "romanization": "${dateObject.romanization}",
  "english": "${dateObject.english}",
  "exampleTH": "${dateObject.exampleTH}",
  "exampleEN": "${dateObject.exampleEN}",
  "$id": "${dateObject.$id}"
}

### TASK:
1. TOKENIZATION: Break down "exampleTH" into logically meaningful Thai words/tokens. Do NOT split in the middle of a word or separate vowels from their consonants.
2. HOKKIEN TRANSLATION: Provide the Taiwanese Hokkien (Traditional Hanzi) and its POJ/KIP Romanization for the primary word and the example sentence.
3. **cultural_note**:
   - Must be written in English to explain the sentence structure.
   - Must mention "Taiwanese Hokkien (Traditional Hanzi) translation" and include the Thai example sentence with cultural insights.
   - **NO META-TALK**: Do not mention instructions in the response.
4. OUTPUT FORMAT: Return ONLY a valid JSON object.

### RULES FOR TOKENIZATION:
- Ensure tokens are meaningful (e.g., "ที่นี่", "อันตราย", "มาก").
- Remove punctuation from tokens.
- The joined tokens must reconstruct the original "exampleTH" (ignoring spaces).

### EXPECTED OUTPUT JSON STRUCTURE:
{
  "thai": "...",
  "romanization": "...",
  "english": "...",
  "exampleTH": "...",
  "exampleEN": "...",
  "$id": "...",
  "tokens_th": ["...", "..."],
  "cultural_note": "..."
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

  return { fetchMyVocabularyQuestion, loading, error }
}