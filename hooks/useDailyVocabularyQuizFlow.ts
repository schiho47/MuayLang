import { useEffect, useMemo, useRef, useState } from 'react'

import type { QuizQuestion } from '@/hooks/useGetQuizQuestion'
import type { DailyVocabularyWord } from '@/lib/dailyVocabularyAPI'

type SummaryItem = {
  index: number
  question: string
  questionEn?: string
  questionTwH?: string
  answer: string
  answerEn?: string
  answerTwH?: string
  hadWrong: boolean
}

const QUESTION_COUNT = 10

const shuffleWithIndices = <T,>(arr: T[]) => {
  const indices = arr.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.map((i) => arr[i])
}

const replaceFirst = (text: string, search: string, replace: string) => {
  const idx = text.indexOf(search)
  if (idx === -1) return text
  return text.slice(0, idx) + replace + text.slice(idx + search.length)
}

const uniqueByThai = (words: DailyVocabularyWord[]) => {
  const seen = new Set<string>()
  const out: DailyVocabularyWord[] = []
  for (const w of words) {
    const key = (w?.th ?? '').trim()
    if (!key) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  return out
}

const pickDistractors = (pool: DailyVocabularyWord[], correct: DailyVocabularyWord, count: number) => {
  const candidates = pool.filter((w) => w.th !== correct.th)
  const shuffled = shuffleWithIndices(candidates)
  const picked: DailyVocabularyWord[] = []
  for (let i = 0; i < count; i += 1) {
    if (shuffled[i]) picked.push(shuffled[i])
  }
  // If not enough words, pad by cycling (can repeat)
  let padIdx = 0
  while (picked.length < count && pool.length > 0) {
    const w = pool[padIdx % pool.length]
    if (w) picked.push(w)
    padIdx += 1
  }
  return picked.slice(0, count)
}

const buildOptionDisplay = (w: DailyVocabularyWord) =>
  `EN: ${w.word} | 台羅: ${w.tw_r} | 台語漢字: ${w.tw_h}`

const buildWordMatchOption = (w: DailyVocabularyWord) => `EN: ${w.word} | 台語漢字: ${w.tw_h}`

const buildDailyQuestions = (pool: DailyVocabularyWord[]): QuizQuestion[] => {
  if (!pool.length) return []

  const shuffledPool = shuffleWithIndices(pool)
  const questions: QuizQuestion[] = []

  for (let i = 0; i < QUESTION_COUNT; i += 1) {
    const word = shuffledPool[i % shuffledPool.length]
    const type: QuizQuestion['quiz_type'] = i % 2 === 0 ? 'TYPE_B' : 'TYPE_A'
    const distractors = pickDistractors(shuffledPool, word, 3)
    const optionWords = [word, ...distractors]

    if (type === 'TYPE_B') {
      const options = optionWords.map(buildWordMatchOption)
      const options_display = optionWords.map((w) => `台羅: ${w.tw_r}`)

      const paired = options.map((opt, idx) => ({ opt, disp: options_display[idx], isCorrect: idx === 0 }))
      const shuffled = shuffleWithIndices(paired)

      questions.push({
        quiz_type: 'TYPE_B',
        question: word.th,
        phonetic: word.roman,
        options: shuffled.map((p) => p.opt),
        options_display: shuffled.map((p) => p.disp),
        answerIndex: Math.max(0, shuffled.findIndex((p) => p.isCorrect)),
        cultural_note: `EN: ${word.word} 【台語漢字：${word.tw_h}｜台羅：${word.tw_r}】`,
        encouragement: '',
      })
    } else {
      const cloze = word.ex_th ? replaceFirst(word.ex_th, word.th, '____') : `____`
      const options = optionWords.map((w) => w.th)
      const options_display = optionWords.map(buildOptionDisplay)

      const paired = options.map((opt, idx) => ({ opt, disp: options_display[idx], isCorrect: idx === 0 }))
      const shuffled = shuffleWithIndices(paired)

      questions.push({
        quiz_type: 'TYPE_A',
        question: cloze,
        phonetic: word.roman,
        options: shuffled.map((p) => p.opt),
        options_display: shuffled.map((p) => p.disp),
        answerIndex: Math.max(0, shuffled.findIndex((p) => p.isCorrect)),
        cultural_note: `EN: ${word.ex_en} 【台語漢字：${word.ex_tw}】`,
        encouragement: '',
      })
    }
  }

  return questions
}

export const useDailyVocabularyQuizFlow = (words?: DailyVocabularyWord[]) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [results, setResults] = useState<SummaryItem[]>([])
  const [resetKey, setResetKey] = useState(0)
  const wrongMapRef = useRef(new Map<number, boolean>())

  useEffect(() => {
    const pool = uniqueByThai(words ?? [])
    const nextQuestions = buildDailyQuestions(pool)
    setQuestions(nextQuestions)
    setCurrentIndex(0)
    setSelectedIndex(null)
    setIsCorrect(false)
    setResults([])
    wrongMapRef.current = new Map()
  }, [words, resetKey])

  const totalQuestions = questions.length
  const questionNumber = totalQuestions > 0 ? currentIndex + 1 : 0
  const currentQuestion = totalQuestions > 0 ? questions[currentIndex] : null
  const canGoNext = isCorrect && currentIndex < totalQuestions - 1

  const handleSelectOption = (index: number) => {
    if (!currentQuestion || isCorrect) return
    setSelectedIndex(index)
    const correct = index === currentQuestion.answerIndex
    if (!correct) {
      wrongMapRef.current.set(currentIndex, true)
      setIsCorrect(false)
      return
    }

    const hadWrong = wrongMapRef.current.get(currentIndex) ?? false

    // Derive summary fields from the option text / display where possible.
    if (currentQuestion.quiz_type === 'TYPE_B') {
      // question is Thai word; options include EN + 台語漢字
      const answerText = currentQuestion.options?.[currentQuestion.answerIndex] ?? ''
      const answerHanziMatch = /台語漢字:\s*(.+)$/.exec(answerText)
      const answerEnMatch = /EN:\s*([^|]+)\s*\|/.exec(answerText)
      const answerEn = answerEnMatch?.[1]?.trim()
      const answerTwH = answerHanziMatch?.[1]?.trim()

      setResults((prev) => {
        const next = prev.filter((item) => item.index !== currentIndex)
        next.push({
          index: currentIndex,
          question: currentQuestion.question,
          questionEn: answerEn,
          questionTwH: answerTwH,
          answer: answerText,
          answerEn,
          answerTwH,
          hadWrong,
        })
        return next.sort((a, b) => a.index - b.index)
      })
    } else {
      // cloze: answer is Thai word
      const answerThai = currentQuestion.options?.[currentQuestion.answerIndex] ?? ''
      const disp = currentQuestion.options_display?.[currentQuestion.answerIndex] ?? ''
      const enMatch = /EN:\s*([^|]+)\s*\|/.exec(disp)
      const hanziMatch = /台語漢字:\s*(.+)$/.exec(disp)

      setResults((prev) => {
        const next = prev.filter((item) => item.index !== currentIndex)
        next.push({
          index: currentIndex,
          question: currentQuestion.question,
          questionEn: undefined,
          questionTwH: undefined,
          answer: answerThai,
          answerEn: enMatch?.[1]?.trim(),
          answerTwH: hanziMatch?.[1]?.trim(),
          hadWrong,
        })
        return next.sort((a, b) => a.index - b.index)
      })
    }

    setIsCorrect(true)
  }

  const handleNext = () => {
    if (!canGoNext) return
    setCurrentIndex((prev) => prev + 1)
    setSelectedIndex(null)
    setIsCorrect(false)
  }

  const resetQuiz = () => setResetKey((k) => k + 1)

  const summaryItems = useMemo(() => results.slice().sort((a, b) => a.index - b.index), [results])
  const correctCount = summaryItems.filter((item) => !item.hadWrong).length
  const wrongCount = summaryItems.filter((item) => item.hadWrong).length
  const isFinished =
    totalQuestions > 0 &&
    summaryItems.length === totalQuestions &&
    isCorrect &&
    currentIndex === totalQuestions - 1

  return {
    questionNumber,
    totalQuestions,
    currentQuestion,
    selectedIndex,
    isCorrect,
    canGoNext,
    handleSelectOption,
    handleNext,
    resetQuiz,
    summaryItems,
    correctCount,
    wrongCount,
    isFinished,
  }
}

