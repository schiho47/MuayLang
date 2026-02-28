import React from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { Box, HStack, Pressable, Text as GText, VStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import useSpeech from '@/hooks/useSpeech'
import SpeakerButton from '@/components/ui/SpeakerButton'

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

type VocabularyReviewSummaryProps = {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  summaryItems: SummaryItem[]
  onBack: () => void
  onReplay: () => void
}

const VocabularyReviewSummary = ({
  totalQuestions,
  correctCount,
  wrongCount,
  summaryItems,
  onBack,
  onReplay,
}: VocabularyReviewSummaryProps) => {
  const { speak } = useSpeech()
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
          <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={MUAY_PURPLE} />
          </TouchableOpacity>
          <HStack flex={1} alignItems="center" justifyContent="center">
            <Text
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: MUAY_PURPLE,
                padding: 24,
              }}
            >
              Summary
            </Text>
          </HStack>
        </HStack>
      </Box>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>
        <VStack space="lg">
          <HStack space="md">
            <Box
              flex={1}
              bg="$backgroundLight50"
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor="$backgroundLight200"
            >
              <GText color="$text400" size="sm">
                Total
              </GText>
              <GText color={MUAY_PURPLE} size="xl" fontWeight="$bold">
                {totalQuestions}
              </GText>
            </Box>
            <Box
              flex={1}
              bg="$backgroundLight50"
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor="$backgroundLight200"
            >
              <GText color="$text400" size="sm">
                Correct
              </GText>
              <GText color="#2ecc71" size="xl" fontWeight="$bold">
                {correctCount}
              </GText>
            </Box>
            <Box
              flex={1}
              bg="$backgroundLight50"
              borderRadius="$lg"
              p="$4"
              borderWidth={1}
              borderColor="$backgroundLight200"
            >
              <GText color="$text400" size="sm">
                Wrong
              </GText>
              <GText color="#ef4444" size="xl" fontWeight="$bold">
                {wrongCount}
              </GText>
            </Box>
          </HStack>

          <Box bg="$backgroundLight200" borderRadius="$full" h="$2" overflow="hidden">
            <Box
              bg="#2ecc71"
              h="$2"
              style={{ width: `${(correctCount / Math.max(totalQuestions, 1)) * 100}%` }}
            />
          </Box>

          <VStack space="md">
            {summaryItems.map((item) => (
              <Box
                key={item.index}
                bg="$white"
                borderRadius="$lg"
                p="$4"
                borderWidth={1}
                borderColor={item.hadWrong ? '#ef4444' : '$backgroundLight200'}
              >
                <GText color="$text400" size="sm">
                  Question {item.index + 1}
                </GText>
                <HStack space="sm" alignItems="center">
                <GText color={MUAY_PURPLE} fontWeight="$bold" mt="$1">
                  {item.question}
                </GText>
                <SpeakerButton
                    onPress={() => speak(item.question.replace('____', item.answer))}
                    accessibilityLabel={`Speak answer ${item.index + 1}`}
                    size={18}
                    color={MUAY_PURPLE}
                  />
                  </HStack>
                {item.questionEn ? (
                  <GText color={MUAY_PURPLE} mt="$1" style={{ fontSize: 13 }}>
                    EN: {item.questionEn}
                  </GText>
                ) : null}
                {item.questionTwH ? (
                  <GText color={MUAY_PURPLE} mt="$1" style={{ fontSize: 13 }}>
                    台語漢字: {item.questionTwH}
                  </GText>
                ) : null}
                <GText color="$text400" size="sm" mt="$2">
                  Answer
                </GText>
                  <GText color={item.hadWrong ? '#ef4444' : MUAY_PURPLE} fontWeight="$bold">
                    {item.answer}
                  </GText>
                  {item.answerEn ? (
                    <GText color={MUAY_PURPLE} mt="$1" style={{ fontSize: 13 }}>
                      EN: {item.answerEn}
                    </GText>
                  ) : null}
                  {item.answerTwH ? (
                    <GText color={MUAY_PURPLE} mt="$1" style={{ fontSize: 13 }}>
                      台語漢字: {item.answerTwH}
                    </GText>
                  ) : null}
              </Box>
            ))}
          </VStack>

          <HStack space="md" justifyContent="space-between">
            <Pressable
              onPress={onBack}
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: MUAY_PURPLE,
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <GText color={MUAY_PURPLE} fontWeight="$bold">
                Back
              </GText>
            </Pressable>
            <Pressable
              onPress={onReplay}
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                flex: 1,
                backgroundColor: MUAY_PURPLE,
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <GText color="$white" fontWeight="$bold">
                Play again
              </GText>
            </Pressable>
          </HStack>
        </VStack>
      </ScrollView>
    </Box>
  )
}

export default VocabularyReviewSummary
