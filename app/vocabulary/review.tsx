import React, { useState, useMemo } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Box, HStack, Pressable, Text as GText, VStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useQuizDateData } from '@/lib/dailyVocabularyAPI'
import { useGetQuizQuestion } from '@/hooks/useGetQuizQuestion'
import { useQuizFlow } from '@/hooks/useQuizFlow'
import type { QuizDateWord } from '@/lib/quizPrefetch'
import useSpeech from '@/hooks/useSpeech'
const VocabularyReview = () => {
  const { dates } = useLocalSearchParams<{ dates?: string }>()
  const dateList = useMemo(() => (dates ? dates.split(',').filter(Boolean) : []), [dates])
  const { data: quizDateData } = useQuizDateData(dateList)
  const { fetchQuestion, loading, error } = useGetQuizQuestion()
  const { speak } = useSpeech()
  const [isQuestionPressed, setIsQuestionPressed] = useState(false)
  const {
    questionNumber,
    totalQuestions,
    currentQuestion,
    selectedIndex,
    isCorrect,
    canGoNext,
    handleSelectOption,
    handleNext,
  } = useQuizFlow({
    quizDateData: (quizDateData as QuizDateWord[] | null) ?? undefined,
    fetchQuestion,
  })

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
                textAlign: 'center',
              }}
            >
              Vocabulary Review
            </Text>
            <Pressable
              onPress={handleNext}
              disabled={!canGoNext}
              accessibilityLabel="Next question"
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                opacity: canGoNext ? 1 : 0.3,
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
          <HStack flex={1} alignItems="flex-start" justifyContent="space-between">
            <GText size="lg" color={MUAY_PURPLE} fontWeight="$bold" flex={1}>
              {loading && !currentQuestion
                ? 'Loading question...'
                : currentQuestion?.question || 'No question available'}
            </GText>
            <Pressable
              onPress={() => speak(currentQuestion?.question ?? '')}
              onPressIn={() => setIsQuestionPressed(true)}
              onPressOut={() => setIsQuestionPressed(false)}
              accessibilityLabel="Speak question"
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                opacity: isQuestionPressed ? 0.6 : 1,
                transform: [{ scale: isQuestionPressed ? 0.95 : 1 }],
                paddingLeft: 8,
              }}
            >
              <Ionicons name="volume-high" size={22} color={MUAY_PURPLE} />
            </Pressable>
          </HStack>
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
