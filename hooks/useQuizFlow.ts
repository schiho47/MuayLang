import { useCallback, useEffect, useRef, useState } from 'react'

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

export const useQuizFlow = ({ quizDateData, fetchQuestion }: UseQuizFlowParams) => {
  const [questionPool, setQuestionPool] = useState<QuizDateWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPrefetchedFirst, setHasPrefetchedFirst] = useState(false)
  const prefetchedRef = useRef(new Map<number, QuizQuestion | null>())
  const inFlightRef = useRef(new Set<number>())

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

    const prefetched = consumePrefetchedQuiz()
    if (prefetched?.pool?.length) {
      setQuestionPool(prefetched.pool)
      setCurrentIndex(0)
      prefetchedRef.current = new Map()
      inFlightRef.current = new Set()
      prefetchedRef.current.set(0, prefetched.firstQuestion ?? null)
      setCurrentQuestion(prefetched.firstQuestion ?? null)
      setHasPrefetchedFirst(!!prefetched.firstQuestion)
      return
    }

    const pool = buildQuestionPool(quizDateData)
    setQuestionPool(pool)
    setCurrentIndex(0)
    prefetchedRef.current = new Map()
    inFlightRef.current = new Set()
    setCurrentQuestion(null)
    setHasPrefetchedFirst(false)
  }, [quizDateData])

  useEffect(() => {
    if (questionPool.length === 0) return
    const currentWord = questionPool[currentIndex]
    if (!currentWord) return
    setSelectedIndex(null)
    setIsCorrect(false)
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
    setIsCorrect(index === currentQuestion.answerIndex)
  }

  const handleNext = () => {
    if (!canGoNext) return
    setCurrentIndex((prev) => prev + 1)
  }

  return {
    questionNumber,
    totalQuestions,
    currentQuestion,
    selectedIndex,
    isCorrect,
    canGoNext,
    handleSelectOption,
    handleNext,
  }
}
