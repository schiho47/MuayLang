import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Box, HStack, Pressable, Text as GText, VStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useQuizDateData } from '@/lib/dailyVocabularyAPI'
import { QuizQuestion, useGetQuizQuestion } from '@/hooks/useGetQuizQuestion'
import { consumePrefetchedQuiz, QuizDateWord } from '@/lib/quizPrefetch'
const VocabularyReview = () => {
  const { dates } = useLocalSearchParams<{ dates?: string }>()
  const dateList = useMemo(() => (dates ? dates.split(',').filter(Boolean) : []), [dates])
  const { data: quizDateData } = useQuizDateData(dateList)
  const { fetchQuestion, loading, error } = useGetQuizQuestion()
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

  const normalizeWordForQuiz = (word: QuizDateWord) => ({
    ...word,
    dateId: word.dayId ?? word.id ?? '',
    tags: word.tags ?? '',
  })

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

    const pool = [...(quizDateData as QuizDateWord[])]
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    setQuestionPool(pool.slice(0, 10))
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
    if (!isCorrect || currentIndex >= totalQuestions - 1) return
    setCurrentIndex((prev) => prev + 1)
  }

  return (
    <Box flex={1} bg={MUAY_WHITE}>
      <Box
        style={{
          backgroundColor: MUAY_WHITE,
          paddingTop: 44,
          paddingBottom: 8,
          paddingHorizontal: 8,
        }}
      >
        <HStack style={{ alignItems: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity
            onPress={() => {
              router.back()
            }}
            style={{ padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={MUAY_PURPLE} />
          </TouchableOpacity>
          <HStack flex={1} alignItems="center" justifyContent="space-between">
            <Text
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: MUAY_PURPLE,
                padding: 24,
                paddingLeft: 40,
              }}
            >
              Vocabulary Review
            </Text>
            <Pressable
              onPress={handleNext}
              disabled={!isCorrect || currentIndex >= totalQuestions - 1}
              accessibilityLabel="Next question"
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                opacity: !isCorrect || currentIndex >= totalQuestions - 1 ? 0.3 : 1,
                paddingRight: 8,
              }}
            >
              <Ionicons name="arrow-forward-circle" size={28} color={MUAY_PURPLE} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
      <VStack space="lg" px="$5" py="$6">
        <HStack justifyContent="flex-end">
          <GText size="sm" color="$text400">
            {questionNumber}/{totalQuestions}
          </GText>
        </HStack>
        <HStack alignItems="flex-start" space="sm">
          <GText size="lg" color={MUAY_PURPLE}>
            {questionNumber}.
          </GText>
          <GText size="lg" color={MUAY_PURPLE} fontWeight="$bold" flex={1}>
            {loading && !currentQuestion
              ? 'Loading question...'
              : currentQuestion?.question || 'No question available'}
          </GText>
        </HStack>

        <VStack space="md">
          {currentQuestion?.options?.map((option, index) => {
            const isSelected = selectedIndex === index
            const isAnswer = currentQuestion.answerIndex === index
            const showFeedback = selectedIndex !== null && isSelected
            const borderColor = showFeedback ? (isAnswer ? '#2ecc71' : '#ef4444') : MUAY_PURPLE
            const textColor = showFeedback ? (isAnswer ? '#2ecc71' : '#ef4444') : MUAY_PURPLE

            return (
              <Pressable
                key={`${index}-${option}`}
                onPress={() => handleSelectOption(index)}
                disabled={isCorrect}
                sx={{
                  ':active': { opacity: 0.6 },
                }}
              >
                <Box
                  bg={MUAY_WHITE}
                  borderRadius="$xl"
                  px="$4"
                  py="$4"
                  borderWidth={1}
                  borderColor={borderColor}
                >
                  <GText color={textColor}>
                    {String.fromCharCode(65 + index)}. {option}
                  </GText>
                  {showFeedback ? (
                    <VStack space="xs" alignItems="flex-start" mt="$3">
                      <Ionicons
                        name={isAnswer ? 'checkmark' : 'close'}
                        size={16}
                        color={isAnswer ? '#2ecc71' : '#ef4444'}
                      />
                      {isAnswer ? (
                        <VStack space="xs">
                          <GText color="#2ecc71" fontWeight="$bold">
                            Correct!
                          </GText>
                          <GText
                            color="#2ecc71"
                            fontSize={16}
                            fontWeight="$normal"
                            style={{ flexWrap: 'wrap', flexShrink: 1, width: '100%' }}
                          >
                            {currentQuestion?.cultural_note}
                          </GText>
                        </VStack>
                      ) : (
                        <GText color="#ef4444" fontWeight="$bold">
                          Try again
                        </GText>
                      )}
                    </VStack>
                  ) : null}
                </Box>
              </Pressable>
            )
          })}

          {error ? (
            <GText color="#ef4444" mt="$2">
              {error}
            </GText>
          ) : null}
        </VStack>

        {/* <HStack alignItems="center" space="xs" mt="$2">
          <GText color="$text300">顯示提示</GText>
          <Ionicons name="chevron-down" size={16} color="#9ca3af" />
        </HStack> */}
      </VStack>
    </Box>
  )
}

export default VocabularyReview
