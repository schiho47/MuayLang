import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { QuizQuestion } from '@/hooks/useGetQuizQuestion'
import { consumePrefetchedQuiz, type QuizDateWord } from '@/lib/quizPrefetch'

const replaceFirst = (text: string, search: string, replace: string) => {
  const idx = text.indexOf(search)
  if (idx === -1) return text
  return text.slice(0, idx) + replace + text.slice(idx + search.length)
}

const shuffleArray = <T,>(arr: T[]) => {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

type FetchQuestion = (payload: {
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
}) => Promise<QuizQuestion | null>

type UseQuizFlowParams = {
  quizDateData?: QuizDateWord[]
  fetchQuestion: FetchQuestion
}

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

export const useQuizFlow = ({ quizDateData, fetchQuestion }: UseQuizFlowParams) => {
  const [questionPool, setQuestionPool] = useState<QuizDateWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPrefetchedFirst, setHasPrefetchedFirst] = useState(false)
  const [results, setResults] = useState<SummaryItem[]>([])
  const [resetKey, setResetKey] = useState(0)
  const prefetchedRef = useRef(new Map<number, QuizQuestion | null>())
  const inFlightRef = useRef(new Set<number>())
  const wrongMapRef = useRef(new Map<number, boolean>())

  const totalQuestions = questionPool.length
  const questionNumber = totalQuestions > 0 ? currentIndex + 1 : 0
  const canGoNext = isCorrect && currentIndex < totalQuestions - 1

  const normalizeWordForQuiz = (word: QuizDateWord) => ({
    ...word,
    dateId: word.dayId ?? word.id ?? '',
    tags: word.tags ?? '',
  })

  const buildQuestionPool = (data: QuizDateWord[]) => {
    const pool = [...data]
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, 10)
  }

  const shouldUseLocalQuestion = (index: number) => index >= 0 && index < 4

  const buildLocalQuestion = useCallback(
    (index: number): QuizQuestion | null => {
      const word = questionPool[index]
      if (!word) return null

      const sourceDateId = word.dayId ?? word.id ?? ''
      const sourceTags = word.tags ?? ''
      const sourceLine = `來源：${sourceDateId}${sourceTags ? `｜主題：${sourceTags}` : ''}`

      const distractorPool = questionPool.filter((w) => w?.th && w.th !== word.th)
      const distractors = shuffleArray(distractorPool).slice(0, 3)

      const optionWords = [word, ...distractors]

      // Alternate types: even -> TYPE_B, odd -> TYPE_A
      if (index % 2 === 0) {
        // TYPE_B: Thai word -> English options
        const options = optionWords.map((w) => w.word ?? '')
        const options_display = optionWords.map(
          (w) => `EN: ${w.word ?? ''} | 台羅: ${w.tw_r ?? ''} | 台語漢字: ${w.tw_h ?? ''}`,
        )
        const paired = options.map((opt, i) => ({ opt, disp: options_display[i], isCorrect: i === 0 }))
        const shuffledPaired = shuffleArray(paired)
        return {
          quiz_type: 'TYPE_B',
          question: word.th ?? '',
          phonetic: word.roman ?? '',
          options: shuffledPaired.map((p) => p.opt),
          options_display: shuffledPaired.map((p) => p.disp),
          answerIndex: Math.max(0, shuffledPaired.findIndex((p) => p.isCorrect)),
          cultural_note: `${sourceLine}\nEN: ${word.ex_en ?? ''} 【台語漢字：${word.ex_tw ?? ''}】`,
          encouragement: '',
        }
      }

      // TYPE_A: Cloze example -> Thai options
      const cloze =
        word.ex_th && word.th
          ? replaceFirst(word.ex_th, word.th, '____')
          : word.ex_th
            ? word.ex_th
            : '____'
      const options = optionWords.map((w) => w.th ?? '')
      const options_display = optionWords.map(
        (w) => `EN: ${w.word ?? ''} | 台羅: ${w.tw_r ?? ''} | 台語漢字: ${w.tw_h ?? ''}`,
      )
      const paired = options.map((opt, i) => ({ opt, disp: options_display[i], isCorrect: i === 0 }))
      const shuffledPaired = shuffleArray(paired)
      return {
        quiz_type: 'TYPE_A',
        question: cloze,
        phonetic: word.roman ?? '',
        options: shuffledPaired.map((p) => p.opt),
        options_display: shuffledPaired.map((p) => p.disp),
        answerIndex: Math.max(0, shuffledPaired.findIndex((p) => p.isCorrect)),
        cultural_note: `${sourceLine}\nEN: ${word.ex_en ?? ''} 【台語漢字：${word.ex_tw ?? ''}】`,
        encouragement: '',
      }
    },
    [questionPool],
  )

  const prefetchQuestionAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= questionPool.length) return
      if (prefetchedRef.current.has(index) || inFlightRef.current.has(index)) return
      const word = questionPool[index]
      if (!word) return
      if (shouldUseLocalQuestion(index)) {
        const localQ = buildLocalQuestion(index)
        prefetchedRef.current.set(index, localQ)
        return
      }
      inFlightRef.current.add(index)
      fetchQuestion(normalizeWordForQuiz(word))
        .then((result) => {
          prefetchedRef.current.set(index, result ?? buildLocalQuestion(index))
        })
        .catch(() => {
          // AI failure fallback: fixed local question type
          prefetchedRef.current.set(index, buildLocalQuestion(index))
        })
        .finally(() => {
          inFlightRef.current.delete(index)
        })
    },
    [questionPool, fetchQuestion, buildLocalQuestion],
  )

  useEffect(() => {
    if (!quizDateData || quizDateData.length === 0) return

    if (resetKey === 0) {
      const prefetched = consumePrefetchedQuiz()
      if (prefetched?.pool?.length) {
        setQuestionPool(prefetched.pool)
        setCurrentIndex(0)
        prefetchedRef.current = new Map()
        inFlightRef.current = new Set()
        wrongMapRef.current = new Map()
        prefetchedRef.current.set(0, prefetched.firstQuestion ?? null)
        setCurrentQuestion(prefetched.firstQuestion ?? null)
        setHasPrefetchedFirst(!!prefetched.firstQuestion)
        setResults([])
        return
      }
    }

    const pool = buildQuestionPool(quizDateData)
    setQuestionPool(pool)
    setCurrentIndex(0)
    prefetchedRef.current = new Map()
    inFlightRef.current = new Set()
    wrongMapRef.current = new Map()
    setCurrentQuestion(null)
    setHasPrefetchedFirst(false)
    setResults([])
  }, [quizDateData, resetKey])

  useEffect(() => {
    if (questionPool.length === 0) return
    const currentWord = questionPool[currentIndex]
    if (!currentWord) return
    setSelectedIndex(null)
    setIsCorrect(false)
    if (!wrongMapRef.current.has(currentIndex)) {
      wrongMapRef.current.set(currentIndex, false)
    }

    const cached = prefetchedRef.current.get(currentIndex)
    if (cached !== undefined) {
      setCurrentQuestion(cached)
      prefetchQuestionAt(currentIndex + 1)
      return
    }

    if (shouldUseLocalQuestion(currentIndex)) {
      const localQ = buildLocalQuestion(currentIndex)
      prefetchedRef.current.set(currentIndex, localQ)
      setCurrentQuestion(localQ)
      prefetchQuestionAt(currentIndex + 1)
      return
    }

    setCurrentQuestion(null)
    let isActive = true
    fetchQuestion(normalizeWordForQuiz(currentWord))
      .then((result) => {
        if (!isActive) return
        const nextQ = result ?? buildLocalQuestion(currentIndex)
        prefetchedRef.current.set(currentIndex, nextQ)
        setCurrentQuestion(nextQ)
        prefetchQuestionAt(currentIndex + 1)
      })
      .catch(() => {
        if (!isActive) return
        // AI failure fallback: fixed local question type
        const nextQ = buildLocalQuestion(currentIndex)
        prefetchedRef.current.set(currentIndex, nextQ)
        setCurrentQuestion(nextQ)
        prefetchQuestionAt(currentIndex + 1)
      })
    return () => {
      isActive = false
    }
  }, [
    questionPool,
    currentIndex,
    fetchQuestion,
    hasPrefetchedFirst,
    buildLocalQuestion,
    prefetchQuestionAt,
  ])

  const handleSelectOption = (index: number) => {
    if (!currentQuestion || isCorrect) return
    setSelectedIndex(index)
    const correct = index === currentQuestion.answerIndex
    if (!correct) {
      wrongMapRef.current.set(currentIndex, true)
      setIsCorrect(false)
      return
    }

    const currentWord = questionPool[currentIndex]
    const answerText = currentQuestion.options?.[currentQuestion.answerIndex] ?? ''
    const hadWrong = wrongMapRef.current.get(currentIndex) ?? false

    const isTypeA = currentQuestion.quiz_type === 'TYPE_A'
    const questionEn = isTypeA ? currentWord?.ex_en : currentWord?.word
    const questionTwH = isTypeA ? currentWord?.ex_tw : currentWord?.tw_h
    const answerEn = isTypeA ? currentWord?.word : answerText
    const answerTwH = currentWord?.tw_h

    setResults((prev) => {
      const next = prev.filter((item) => item.index !== currentIndex)
      next.push({
        index: currentIndex,
        question: currentQuestion.question,
        questionEn: questionEn || undefined,
        questionTwH: questionTwH || undefined,
        answer: answerText,
        answerEn: answerEn || undefined,
        answerTwH: answerTwH || undefined,
        hadWrong,
      })
      return next.sort((a, b) => a.index - b.index)
    })
    setIsCorrect(true)
  }

  const handleNext = () => {
    if (!canGoNext) return
    setCurrentIndex((prev) => prev + 1)
  }

  const resetQuiz = () => {
    setResetKey((prev) => prev + 1)
  }

  const summaryItems = useMemo(() => {
    return results.slice().sort((a, b) => a.index - b.index)
  }, [results])

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
