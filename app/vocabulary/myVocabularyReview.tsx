import React, { useMemo } from 'react'
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Box, HStack, Pressable, Text as GText, VStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

import useSpeech from '@/hooks/useSpeech'
import VocabularyReviewSummary from '@/components/learning/VocabularyReviewSummary'
import SpeakerButton from '@/components/ui/SpeakerButton'
import { useMyVocabularyQuiz } from '@/hooks/useMyVocabularyQuiz'
import { useMyVocabularyQuizFlow } from '@/hooks/useMyVocabularyQuizFlow'
import { Spinner } from '@/components/ui/spinner'
import { useVocabularies } from '@/lib/learningAPI'
import { useUser } from '@/hooks/useUser'
import type { VocabularyDataType } from '@/components/learning/type'


const MyVocabularyReview = () => {
  // 1. 取得路由參數並解析單字列表
  const { vocabularies } = useLocalSearchParams<{ vocabularies?: string }>()
  const vocabulariesList = useMemo(() => 
    vocabularies?.split(',').filter(Boolean).map(id => id.trim()) || [], 
    [vocabularies]
  )

  // 2. 初始化 Gemini AI Hook 與 測驗流程 Hook
  const { user } = useUser()
  const { data: allVocabularies, isLoading: vocabLoading } = useVocabularies(user?.$id)
  const selectedVocabularies = useMemo(() => {
    const list = (allVocabularies as VocabularyDataType[]) || []
    if (vocabulariesList.length === 0) return list
    const idSet = new Set(vocabulariesList)
    return list.filter((item) => idSet.has(item.$id))
  }, [allVocabularies, vocabulariesList])
  const { fetchMyVocabularyQuestion, loading, error } = useMyVocabularyQuiz()
  const { speak } = useSpeech()
  
  const {
    questionNumber,
    totalQuestions,
    currentQuestion,
    shuffledTokens,   // 亂序的碎片 [{id, text, used}]
    userSequence,     // 使用者拼出的字串陣列
    isCorrect,
    handleTokenClick, // 點擊碎片邏輯
    handleRemoveToken,
    handleNext,
    resetQuiz,
    summaryItems,
    correctCount,
    wrongCount,
    isFinished,
  } = useMyVocabularyQuizFlow(selectedVocabularies, fetchMyVocabularyQuestion)

  // 3. 結算畫面
  if (isFinished) {
    return (
      <VocabularyReviewSummary
        totalQuestions={totalQuestions}
        correctCount={correctCount}
        wrongCount={wrongCount}
        summaryItems={summaryItems}
        onBack={() => router.back()}
        onReplay={resetQuiz}
      />
    )
  }


  if ((loading || vocabLoading) && !currentQuestion) {
    return (
      <Box flex={1} bg={MUAY_WHITE} alignItems="center" justifyContent="center">
        <Spinner color={MUAY_PURPLE} size="large" />
        <GText mt="$3" size="md" color={MUAY_PURPLE} fontWeight="$bold">
          Generating...
        </GText>
      </Box>
    )
  }

  return (
    <Box flex={1} bg={MUAY_WHITE}>
      {/* Header 導航欄 */}
      <Box pt={50} pb={10} px={10} bg={MUAY_WHITE} borderBottomWidth={1} borderBottomColor="$coolGray100">
        <HStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color={MUAY_PURPLE} />
          </TouchableOpacity>
          
          <GText size="xl" fontWeight="$bold" color={MUAY_PURPLE} textAlign="center"  fontSize={28} padding={26}>
            Sentence Quiz
          </GText>

          <Pressable onPress={handleNext} style={{ opacity: 1 }}>
            <Ionicons name="arrow-forward-circle" size={32} color={MUAY_PURPLE} />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack space="2xl">
          {/* 進度顯示 */}
          <HStack justifyContent="flex-end">
            <Box bg="$coolGray100" px="$3" py="$1" borderRadius="$full">
              <GText size="xs" color="$text500" fontWeight="$bold">
                {questionNumber} / {totalQuestions}
              </GText>
            </Box>
          </HStack>

          {/* 待選碎片區 (Word Bank) */}
          <VStack space="md" mt="$4">
            <HStack alignItems="center" justifyContent="space-between">
              <GText size="md" color={MUAY_PURPLE} fontWeight="$bold">
                Tap the words in order:
              </GText>
              <SpeakerButton
                onPress={() => speak(currentQuestion?.exampleTH ?? '')}
                accessibilityLabel="Speak Thai example"
                size={22}
                color={MUAY_PURPLE}
              />
            </HStack>
            <HStack flexWrap="wrap" space="md" justifyContent="center">
              {shuffledTokens.map((token) => (
                <Pressable
                  key={token.id}
                  onPress={() => handleTokenClick(token.id, token.text)}
                  disabled={token.used || isCorrect}
                >
                  <Box
                    px="$5"
                    py="$2.5"
                    borderRadius="$xl"
                    borderWidth={1}
                    borderColor={token.used ? "transparent" : MUAY_PURPLE}
                    bg={token.used ? "$coolGray100" : MUAY_WHITE}
                    elevation={token.used ? 0 : 3}
                  >
                    <GText color={token.used ? "$coolGray300" : MUAY_PURPLE} fontWeight="$medium">
                      {token.text}
                    </GText>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </VStack>

          {/* 答案排列區：顯示使用者拼湊的片 */}
          <VStack space="sm">
            <Box 
              minHeight={120} 
              p="$4" 
              bg="$coolGray50" 
              borderWidth={2} 
              borderColor={isCorrect ? "#2ecc71" : "$coolGray200"} 
              borderRadius="$2xl"
              borderStyle={isCorrect ? "solid" : "dashed"}
            >
              <HStack flexWrap="wrap" space="sm">
                {userSequence.map((item, index) => (
                  <HStack
                    key={`ans-${item.id}-${index}`}
                    bg={MUAY_PURPLE}
                    px="$3"
                    py="$2"
                    borderRadius="$lg"
                    alignItems="center"
                    space="xs"
                    elevation={2}
                  >
                    <GText color="white" fontWeight="$bold">
                      {item.text}
                    </GText>
                    {!isCorrect && (
                      <Pressable
                        onPress={() => handleRemoveToken(item.id)}
                        accessibilityLabel="Remove token"
                        sx={{ ':active': { opacity: 0.7 } }}
                      >
                        <Ionicons name="close" size={14} color={MUAY_WHITE} />
                      </Pressable>
                    )}
                  </HStack>
                ))}
              </HStack>
            </Box>
          
          </VStack>

          {/* 題目區：顯示英文翻譯 */}
          <VStack space="md" alignItems="center">
            <GText size="sm" color="$text400" textAlign="center"  fontWeight="$bold">
            English Translation:
            </GText>
            <GText size="xl" color={MUAY_PURPLE} fontWeight="$bold" textAlign="center">
              {currentQuestion?.exampleEN}  
            </GText>
          </VStack>

 
          {/* 答對後顯示：文化註解與發音 */}
          {isCorrect && currentQuestion && (
            <VStack
              p="$5"
              bg={MUAY_WHITE}
              borderRadius="$xl"
              space="md"
              borderWidth={1}
              borderColor="#2ecc71"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="xs" alignItems="center">
                  <Ionicons name="checkmark" size={16} color="#2ecc71" />
                  <GText color="#2ecc71" fontWeight="$bold">
                    Correct!
                  </GText>
                </HStack>
               
              </HStack>

              <GText
                color="#2ecc71"
                fontSize={16}
                fontWeight="$normal"
                style={{ flexWrap: 'wrap', flexShrink: 1, width: '100%' }}
              >
                {currentQuestion?.cultural_note ?? ''}
              </GText>
            </VStack>
          )}

          {error && (
            <Box p="$4" bg="$red50" borderRadius="$lg">
              <GText color="#ef4444" size="sm">{error}</GText>
            </Box>
          )}
        </VStack>
      </ScrollView>
    </Box>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 100,
  },
  iconBtn: {
    padding: 8,
  }
})

export default MyVocabularyReview