import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { QuizQuestion } from '@/hooks/useGetQuizQuestion'
import { consumePrefetchedQuiz, type QuizDateWord } from '@/lib/quizPrefetch'

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
    return pool.slice(0, 5)
  }

  const prefetchQuestionAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= questionPool.length) return
      if (prefetchedRef.current.has(index) || inFlightRef.current.has(index)) return
      const word = questionPool[index]
      if (!word) return
      inFlightRef.current.add(index)
      fetchQuestion(normalizeWordForQuiz(word)).then((result) => {
        prefetchedRef.current.set(index, result)
        inFlightRef.current.delete(index)
      })
    },
    [questionPool, fetchQuestion],
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

    if (hasPrefetchedFirst && currentIndex === 0 && currentQuestion) {
      prefetchQuestionAt(1)
      return
    }

    setCurrentQuestion(null)
    let isActive = true
    fetchQuestion(normalizeWordForQuiz(currentWord)).then((result) => {
      if (!isActive) return
      prefetchedRef.current.set(currentIndex, result)
      setCurrentQuestion(result)
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
    currentQuestion,
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
