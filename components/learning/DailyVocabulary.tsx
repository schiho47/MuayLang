import React, { useMemo, useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Heading,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Center,
  Divider,
} from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import useSpeech from '../../hooks/useSpeech'
import { DailyVocabularyWord, useDailyVocabulary, useQuizDateData } from '@/lib/dailyVocabularyAPI'
import { useGetQuizQuestion } from '@/hooks/useGetQuizQuestion'
import { getRandomFourDate, getTodayKey } from '@/utils/dateUtils'
import { QuizDateWord, setPrefetchedQuiz } from '@/lib/quizPrefetch'

import { MUAY_PURPLE } from '@/constants/Colors'

const DailyVocabularyList = () => {
  const router = useRouter()
  const { data: vocabularyData, isLoading } = useDailyVocabulary(getTodayKey())
  const quizDates = useMemo(() => getRandomFourDate(), [])
  const { data: quizDateData } = useQuizDateData(quizDates)
  const quizCount = quizDateData?.length ?? 0
  const { fetchQuestion } = useGetQuizQuestion()
  const [showModal, setShowModal] = useState(false)
  const [selectedWord, setSelectedWord] = useState<DailyVocabularyWord | null>(null)
  const { speak } = useSpeech()
  const [isExamplePressed, setIsExamplePressed] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)

  console.log({ vocabularyData, selectedWord })
  const handlePress = (item: DailyVocabularyWord) => {
    setSelectedWord(item)
    setShowModal(true)
  }

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

  const handleGoReview = async () => {
    if (!quizDateData || quizDateData.length === 0) {
      router.push({
        pathname: '/vocabulary/review',
        params: { dates: quizDates.join(',') },
      })
      return
    }

    setIsPrefetching(true)
    try {
      const pool = buildQuestionPool(quizDateData as QuizDateWord[])
      const firstWord = pool[0]
      const firstQuestion = firstWord ? await fetchQuestion(normalizeWordForQuiz(firstWord)) : null
      setPrefetchedQuiz({ pool, firstQuestion })
    } finally {
      setIsPrefetching(false)
    }

    router.push({
      pathname: '/vocabulary/review',
      params: { dates: quizDates.join(',') },
    })
  }

  return (
    <Box
      p="$4"
      bg="$white"
      borderRadius="$xl"
      m="$2"
      shadowColor="$backgroundLight900"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
    >
      <VStack alignItems="stretch" mb="$4" space="xs">
        <Heading
          size="md"
          color={MUAY_PURPLE}
          style={{ flexWrap: 'wrap', flexShrink: 1, width: '100%' }}
        >
          Daily Vocabulary - {vocabularyData?.tags || ''}
        </Heading>
        <Pressable
          onPress={handleGoReview}
          disabled={isPrefetching}
          accessibilityLabel={`Go to vocabulary review (${quizCount})`}
          sx={{
            ':active': { opacity: 0.6 },
          }}
          mt="$4"
          style={{ opacity: isPrefetching ? 0.6 : 1, alignSelf: 'flex-end' }}
        >
          <HStack space="xs" alignItems="center">
            <Ionicons name="chevron-forward" size={18} color={MUAY_PURPLE} />
            <Ionicons name="school-outline" size={28} color={MUAY_PURPLE} />
          </HStack>
        </Pressable>
      </VStack>
      <VStack space="sm">
        {isLoading ? (
          <Box
            p="$4"
            bg="$secondary50"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$secondary100"
          >
            <HStack space="sm" alignItems="center">
              <Ionicons name="time-outline" size={18} color={MUAY_PURPLE} />
              <Text size="md" color={MUAY_PURPLE} fontWeight="$bold">
                Loading daily vocabulary...
              </Text>
            </HStack>
          </Box>
        ) : (
          vocabularyData?.words?.map((item: DailyVocabularyWord, index: number) => (
            <Pressable
              key={index}
              onPress={() => handlePress(item)}
              p="$4"
              bg="$secondary50"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$secondary100"
              sx={{
                ':active': { bg: '$secondary100' },
              }}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Center bg={MUAY_PURPLE} w="$5" h="$5" borderRadius="$full">
                    <Text size="xs" color="$white" fontWeight="$bold" fontSize={10}>
                      {index + 1}
                    </Text>
                  </Center>
                  <Text fontWeight="$bold" size="lg" color={MUAY_PURPLE} fontSize={24}>
                    {item.th}
                  </Text>
                  <Pressable
                    onPress={() => speak(item.th)}
                    accessibilityLabel={`Speak ${item.th}`}
                    sx={{
                      ':active': { opacity: 0.6 },
                    }}
                  >
                    <Ionicons name="volume-high" size={20} color={MUAY_PURPLE} />
                  </Pressable>
                </HStack>
                <HStack space="xs" alignItems="center">
                  <Text size="md" color="$text500" fontSize={14} fontWeight="$bold">
                    {item.word}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="$text500" />
                </HStack>
              </HStack>
            </Pressable>
          ))
        )}
      </VStack>

      {/* 詳細資訊 Modal (保持不變) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader borderBottomWidth={1} borderColor="$borderLight100" pb="$3">
            <HStack justifyContent="space-between" alignItems="center" width="100%">
              <VStack flex={1}>
                <Heading size="xl" color={MUAY_PURPLE} fontSize={42} lineHeight={48}>
                  {selectedWord?.th}
                </Heading>
                <Text size="sm" color="$text400" fontSize={18} textAlign="left">
                  {selectedWord?.roman}
                </Text>
              </VStack>
              <Text size="md" color="$text500" textAlign="right" flexShrink={0}>
                {selectedWord?.word}
              </Text>
            </HStack>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody py="$5" pt="$3">
            <VStack space="lg">
              <HStack justifyContent="space-between" alignItems="center" mt="$2" mb="$4">
                <Text size="sm" color="$text500" fontSize={14}>
                  Taiwanese Hokkien
                </Text>
                <VStack alignItems="flex-end" space="xs">
                  <Text size="md" fontWeight="$bold">
                    {selectedWord?.tw_h}
                  </Text>
                  <Text size="md" color={MUAY_PURPLE}>
                    {selectedWord?.tw_r}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
            <Divider />

            <Box bg="$backgroundLight50" p="$4" borderRadius="$md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="md" fontWeight="$medium" mb="$1" fontSize={28} color={MUAY_PURPLE}>
                  {selectedWord?.ex_th}
                </Text>
                <Pressable
                  onPress={() => speak(selectedWord?.ex_th ?? '')}
                  onPressIn={() => setIsExamplePressed(true)}
                  onPressOut={() => setIsExamplePressed(false)}
                  accessibilityLabel="Speak example Thai"
                  sx={{
                    ':active': { opacity: 0.6 },
                  }}
                  style={{
                    opacity: isExamplePressed ? 0.6 : 1,
                    transform: [{ scale: isExamplePressed ? 0.95 : 1 }],
                  }}
                >
                  <Ionicons name="volume-high" size={26} color={MUAY_PURPLE} />
                </Pressable>
              </HStack>
              {/* 例句標籤改為 TW 與 EN */}
              <Text size="sm" color="$text400" mb="$2" mt="$2">
                EN : {selectedWord?.ex_en}
              </Text>
              <Text size="sm" color="$secondary600" mb="$2">
                TW : {selectedWord?.ex_tw}
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default DailyVocabularyList
