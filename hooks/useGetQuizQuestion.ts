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

export const useGetQuizQuestion = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shuffleQuiz = (data: QuizQuestion | null) => {
    if (!data) return null
    const { options, options_display, answerIndex } = data
    const correctIndex = typeof answerIndex === 'number' ? answerIndex : 0
    const correctAnswer = options[correctIndex]

    const indices = options.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }

    const shuffledOptions = indices.map((i) => options[i])
    const shuffledOptionsDisplay = options_display
      ? indices.map((i) => options_display[i])
      : undefined

    return {
      ...data,
      options: shuffledOptions,
      options_display: shuffledOptionsDisplay ?? data.options_display,
      answerIndex: shuffledOptions.indexOf(correctAnswer),
    }
  }
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
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        setError('Missing Gemini API key.')
        setLoading(false)
        return null
      }
      const ai = new GoogleGenAI({ apiKey })
      console.log('dateObject', dateObject)
      const prompt = `
          You are an expert Thai educator. 
      Generate ONE quiz based **STRICTLY** on the provided data.

      ### INPUT DATA:
      - Target Word: "${dateObject.th}"
      - Official Example: "${dateObject.ex_th}"
      - Word Meaning: "${dateObject.word}"

      ### TASK SELECTION (Pick one randomly):
  
    - TYPE A: Contextual Cloze (Sentence filling using "${dateObject.ex_th}")
    - TYPE B: Word Matching (Thai word to English/Hokkien meaning)

      ### REQUIREMENTS BY TYPE:

      #### If TYPE A (Contextual Cloze):
      1. **question**: Use "${dateObject.ex_th}", replace "${dateObject.th}" with "____". 
        **STRICT RULE**: NO English translation in the question field.
      2. **options**: 4 Thai words (Index 0 is correct).
      3. **options_display**: "Thai words with Taiwanese Hanzi after the Thai word(台語漢字)"
      4. **cultural_note**: 
        - Must be written in English to explain the sentence structure.
        - Must mention the topic "${dateObject.dateId}" or "${dateObject.tags}" and comparing related Thai words, and sharing relevant cultural insights. when translating the thai word please add both English and traditional hanzi.*
        - **NO META-TALK**: Do not mention instructions like "please add English" or "share insights" in the actual response. Just provide the explanation and translation.
        - (e.g., "This sentence means We are going to the hospital to see a doctor. 【Taiwanese Hanzi：咱欲去病院揣醫生。】")

     #### If TYPE B (Word Matching):
      1. **question**: Display "${dateObject.th}" only.
      2. **options**: 4 English words (Index 0 is correct).
      3. **options_display**: "English Meaning with Taiwanese Hanzi after the English word (台語漢字)"
      4. **cultural_note**:* Must mention the topic "${dateObject.dateId}" or "${dateObject.tags}" or comparing related Thai words and sharing relevant cultural insights. when translating the thai word please add both English and traditional hanzi.*

        
      ### SHARED RULES:
      - **Taiwanese Hanzi Hokkien Rule**: Use only Traditional Hanzi (誠, 佇, 欲, 揣, 佮). NO Mandarin grammar (avoid 的, 是, 很).
      - **Answer Index**: Correct answer MUST always be at index 0.
      - **Format**: Respond ONLY in JSON.

      ### RESPONSE FORMAT:
      {
        "quiz_type": "TYPE_A or TYPE_B",
        "question": "...",
        "phonetic": "...",
        "options": ["...", "...", "...", "..."],
        "options_display": ["...", "...", "...", "..."],
        "answerIndex": 0,
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

        return shuffleQuiz(JSON.parse(text) as QuizQuestion)
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
