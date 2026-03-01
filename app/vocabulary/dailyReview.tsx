import React, { useMemo } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { Box, HStack, Pressable, Text as GText, VStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useDailyVocabulary } from '@/lib/dailyVocabularyAPI'
import { useDailyVocabularyQuizFlow } from '@/hooks/useDailyVocabularyQuizFlow'
import useSpeech from '@/hooks/useSpeech'
import VocabularyReviewSummary from '@/components/learning/VocabularyReviewSummary'
import SpeakerButton from '@/components/ui/SpeakerButton'

const formatOptionDisplay = (raw?: string) => {
  if (!raw) return ''
  const parts = raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)

  const parsed: Record<string, string> = {}
  for (const part of parts) {
    const m = /^(EN|台羅|台語漢字)\s*:\s*(.+)$/.exec(part)
    if (m) parsed[m[1]] = m[2].trim()
  }

  const en = parsed['EN']
  const hanzi = parsed['台語漢字']
  const roman = parsed['台羅']

  if (en && hanzi && roman) return `EN: ${en} | 台語漢字: ${hanzi}｜台羅: ${roman}`
  if (en && hanzi) return `EN: ${en} | 台語漢字: ${hanzi}`
  if (hanzi && roman) return `台語漢字: ${hanzi}｜台羅: ${roman}`
  return raw
}

const DailyVocabularyReview = () => {
  const { date } = useLocalSearchParams<{ date?: string }>()
  const dateId = useMemo(() => (date ? String(date) : ''), [date])
  const { data: vocabData, isLoading } = useDailyVocabulary(dateId)
  const { speak } = useSpeech()

  const flow = useDailyVocabularyQuizFlow(vocabData?.words ?? [])

  if (flow.isFinished) {
    return (
      <VocabularyReviewSummary
        totalQuestions={flow.totalQuestions}
        correctCount={flow.correctCount}
        wrongCount={flow.wrongCount}
        summaryItems={flow.summaryItems}
        onBack={() => router.back()}
        onReplay={flow.resetQuiz}
      />
    )
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
                textAlign: 'center',
              }}
            >
              Daily Quiz {dateId ? `(${dateId})` : ''}
            </Text>
            <Pressable
              onPress={flow.handleNext}
              disabled={!flow.canGoNext}
              accessibilityLabel="Next question"
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                opacity: flow.canGoNext ? 1 : 0.3,
                paddingRight: 8,
              }}
            >
              <Ionicons name="arrow-forward-circle" size={28} color={MUAY_PURPLE} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>
        <VStack space="lg">
          <HStack justifyContent="flex-end">
            <GText size="sm" color="$text400">
              {flow.questionNumber}/{flow.totalQuestions}
            </GText>
          </HStack>

          <HStack alignItems="flex-start" space="sm">
            <GText size="lg" color={MUAY_PURPLE}>
              {flow.questionNumber}.
            </GText>
            <HStack flex={1} alignItems="flex-start" justifyContent="space-between">
              <GText size="lg" color={MUAY_PURPLE} fontWeight="$bold" flex={1} mr="$2">
                {isLoading && !flow.currentQuestion
                  ? 'Loading...'
                  : flow.currentQuestion?.question || 'No question available'}
              </GText>
              <SpeakerButton
                onPress={() =>
                  speak(
                    flow.currentQuestion?.question.replace(
                      '____',
                      flow.currentQuestion?.options[flow.currentQuestion?.answerIndex] ?? '',
                    ) ?? '',
                  )
                }
                accessibilityLabel="Speak question"
                size={22}
                color={MUAY_PURPLE}
              />
            </HStack>
          </HStack>

          <VStack space="md">
            {flow.currentQuestion?.options?.map((option, index) => {
              const isSelected = flow.selectedIndex === index
              const isAnswer = flow.currentQuestion?.answerIndex === index
              const showFeedback = flow.selectedIndex !== null && isSelected
              const borderColor = showFeedback ? (isAnswer ? '#2ecc71' : '#ef4444') : MUAY_PURPLE
              const textColor = showFeedback ? (isAnswer ? '#2ecc71' : '#ef4444') : MUAY_PURPLE
              const revealTranslations = flow.isCorrect
              const optionDisplay = flow.currentQuestion?.options_display?.[index]
              const formattedOptionDisplay = formatOptionDisplay(optionDisplay)

              return (
                <Pressable
                  key={`${index}-${option}`}
                  onPress={() => flow.handleSelectOption(index)}
                  disabled={flow.isCorrect}
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
                    <VStack space="xs">
                      <GText color={textColor}>
                        {String.fromCharCode(65 + index)}. {option}
                      </GText>
                      {revealTranslations && formattedOptionDisplay ? (
                        <GText
                          color={isAnswer ? '#2ecc71' : MUAY_PURPLE}
                          style={{ flexWrap: 'wrap', flexShrink: 1, fontSize: 13 }}
                        >
                          {formattedOptionDisplay}
                        </GText>
                      ) : null}
                    </VStack>

                    {showFeedback ? (
                      <VStack space="xs" alignItems="flex-start" mt="$3">
                        <Ionicons
                          name={isAnswer ? 'checkmark' : 'close'}
                          size={16}
                          color={isAnswer ? '#2ecc71' : '#ef4444'}
                        />
                        {isAnswer ? (
                          <VStack space="xs" alignItems="flex-start" style={{ width: '100%' }}>
                            <GText color="#2ecc71" fontWeight="$bold">
                              Correct!
                            </GText>
                            <GText
                              color="#2ecc71"
                              fontSize={16}
                              fontWeight="$normal"
                              style={{ flexWrap: 'wrap', flexShrink: 1, width: '100%' }}
                            >
                              {flow.currentQuestion?.cultural_note}
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
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  )
}

export default DailyVocabularyReview

