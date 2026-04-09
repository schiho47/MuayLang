import React, { useEffect, useMemo, useState } from 'react'
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
import { formatDate, getRandomFourDate, getTodayKey } from '@/utils/dateUtils'
import { QuizDateWord, setPrefetchedQuiz } from '@/lib/quizPrefetch'
import SpeakerButton from '@/components/ui/SpeakerButton'
import SearchInput from '@/components/ui/SearchInput'
import { Alert, ScrollView } from 'react-native'
import { useUser } from '@/hooks/useUser'
import { useAddVocabulary, useVocabularies } from '@/lib/learningAPI'
import type { VocabularyDataType } from '@/components/learning/type'

import { MUAY_PURPLE } from '@/constants/Colors'

const normalizeThaiKey = (thai: string) => thai.replace(/\s+/g, ' ').trim()

const toSafeTag = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  let t = trimmed.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, '-')
  t = t.replace(/[|:]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (!t) return null
  if (t.length > 24) t = t.slice(0, 24)
  return t
}

const DailyVocabularyList = () => {
  const router = useRouter()
  const { user } = useUser()
  const { mutateAsync: addVocabulary, isPending: isAddingToMyVocab } = useAddVocabulary()
  const { data: vocabularies } = useVocabularies(user?.$id)
  const [localAddedThaiKeys, setLocalAddedThaiKeys] = useState<Record<string, boolean>>({})

  const existingThaiSet = useMemo(() => {
    const list = (vocabularies as unknown as VocabularyDataType[]) || []
    const set = new Set<string>()
    for (const item of list) {
      const key = normalizeThaiKey(String((item as { thai?: string }).thai ?? ''))
      if (key) set.add(key)
    }
    return set
  }, [vocabularies])
  const todayKey = useMemo(() => getTodayKey(), [])
  const [activeDate, setActiveDate] = useState(todayKey)
  const [inputDateText, setInputDateText] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { data: vocabularyData, isLoading, error } = useDailyVocabulary(activeDate)
  const quizDates = useMemo(() => getRandomFourDate(), [])
  const { data: quizDateData } = useQuizDateData(quizDates)
  const quizCount = quizDateData?.length ?? 0
  const [showModal, setShowModal] = useState(false)
  const [selectedWord, setSelectedWord] = useState<DailyVocabularyWord | null>(null)
  const { speak } = useSpeech()
  const [isPrefetching, setIsPrefetching] = useState(false)

  const handlePress = (item: DailyVocabularyWord) => {
    setSelectedWord(item)
    setShowModal(true)
  }

  const selectedThaiKey = selectedWord ? normalizeThaiKey(selectedWord.th ?? '') : ''
  const alreadyInMyVocab = !!(
    selectedThaiKey &&
    (existingThaiSet.has(selectedThaiKey) || localAddedThaiKeys[selectedThaiKey])
  )

  const handleAddToMyVocabulary = async () => {
    if (user?.isGuest) {
      Alert.alert('Sign in required', 'Guests cannot add to My Vocabulary.')
      return
    }
    if (!user?.$id || !selectedWord) return

    const thaiKey = normalizeThaiKey(selectedWord.th ?? '')
    if (!thaiKey) {
      Alert.alert('Cannot add', 'Missing Thai text.')
      return
    }
    if (existingThaiSet.has(thaiKey) || localAddedThaiKeys[thaiKey]) {
      Alert.alert('Already exists', 'This word is already in My Vocabularies.')
      return
    }

    const dateTag = toSafeTag(`dv-${activeDate}`)
    const topicRaw = vocabularyData?.tags ? `tp-${vocabularyData.tags}` : ''
    const topicTag = toSafeTag(topicRaw)
    const tags = [
      ...new Set(
        [dateTag, topicTag].filter((t): t is string => !!t && t.length <= 24),
      ),
    ]

    const payload = {
      userId: user.$id,
      thai: selectedWord.th || '',
      romanization: selectedWord.roman || '',
      english: selectedWord.word || '',
      exampleTH: selectedWord.ex_th || '',
      exampleEN: selectedWord.ex_en || '',
      note: `From daily vocabulary (${activeDate})`,
      tags,
      favorite: false,
    }

    try {
      const res: { success?: boolean; error?: { message?: string } } = await addVocabulary(payload)
      if (res?.success !== false) {
        setLocalAddedThaiKeys((prev) => ({ ...prev, [thaiKey]: true }))
        Alert.alert('Saved', 'Added to My Vocabulary.')
      } else {
        Alert.alert('Add failed', res?.error?.message || 'Could not save.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add vocabulary.'
      Alert.alert('Add failed', message)
    }
  }

  const buildQuestionPool = (data: QuizDateWord[]) => {
    const pool = [...data]
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool.slice(0, 10)
  }

  const shuffle = <T,>(arr: T[]) => {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  const buildFirstLocalQuestion = (pool: QuizDateWord[]) => {
    const word = pool[0]
    if (!word) return null
    const distractors = shuffle(pool.filter((w) => w?.th && w.th !== word.th)).slice(0, 3)
    const optionWords = [word, ...distractors]

    // TYPE_B (fast): Thai word -> English options
    const options = optionWords.map((w) => w.word ?? '')
    const options_display = optionWords.map(
      (w) => `EN: ${w.word ?? ''} | 台羅: ${w.tw_r ?? ''} | 台語漢字: ${w.tw_h ?? ''}`,
    )
    const paired = options.map((opt, i) => ({ opt, disp: options_display[i], isCorrect: i === 0 }))
    const shuffledPaired = shuffle(paired)

    return {
      quiz_type: 'TYPE_B' as const,
      question: word.th ?? '',
      phonetic: word.roman ?? '',
      options: shuffledPaired.map((p) => p.opt),
      options_display: shuffledPaired.map((p) => p.disp),
      answerIndex: Math.max(0, shuffledPaired.findIndex((p) => p.isCorrect)),
      cultural_note: `EN: ${word.ex_en ?? ''} 【台語漢字：${word.ex_tw ?? ''}】`,
      encouragement: '',
    }
  }

  const dateOptions = useMemo(() => {
    const today = new Date()
    const end = new Date(today)
    end.setDate(end.getDate() - 1)
    const start = new Date(end.getFullYear(), 0, 1)
    const options: { value: string; label: string }[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const value = formatDate(d)
      const label = formatDate(d)
      options.push({ value, label })
    }
    return options
  }, [])

  const filteredDateOptions = useMemo(() => {
    const query = inputDateText.trim()
    if (!query) return []
    return dateOptions.filter(
      (option) =>
        option.label.includes(query) ||
        option.value.includes(query.replace('/', '').padStart(4, '0')),
    )
  }, [dateOptions, inputDateText])

  const handleSelectDate = (value: string) => {
    const option = dateOptions.find((item) => item.value === value)
    setSelectedDate(value)
    setInputDateText(option?.label ?? value)
    setShowSuggestions(false)
  }

  const handleSearchDate = () => {
    if (selectedDate) {
      setActiveDate(selectedDate)
      return
    }
    if (!inputDateText.trim()) {
      setActiveDate(todayKey)
    }
  }

  const canSearch = !!selectedDate || !inputDateText.trim()
  const canTakeQuiz = !user?.isGuest

  const handleGoDailyQuiz = () => {
    if (!canTakeQuiz) return
    router.push({
      pathname: '/vocabulary/dailyReview',
      params: { date: activeDate },
    })
  }

  const handleGoReview = async () => {
    if (!canTakeQuiz) return
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
      // First question is non-AI to avoid long initial wait
      const firstQuestion = buildFirstLocalQuestion(pool)
      setPrefetchedQuiz({ pool, firstQuestion })
    } finally {
      setIsPrefetching(false)
    }

    router.push({
      pathname: '/vocabulary/review',
      params: { dates: quizDates.join(',') },
    })
  }

  useEffect(() => {
    const errorCode = (error as any)?.code ?? (error as any)?.response?.status
    if (errorCode === 401) {
      router.replace('/login')
    }
  }, [error, router])

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
        <VStack space="sm" alignItems="stretch">
          <Box flex={1}>
            <SearchInput
              value={inputDateText}
              onChangeText={(text) => {
                setInputDateText(text)
                setSelectedDate('')
                setShowSuggestions(!!text.trim())
              }}
              placeholder="Search date (e.g. 0109)"
              onClear={() => {
                setInputDateText('')
                setSelectedDate('')
                setShowSuggestions(false)
              }}
              iconPosition="right"
              onIconPress={canSearch ? handleSearchDate : undefined}
              iconDisabled={!canSearch}
              showClear
              iconFilledWhenValue
            />
            {showSuggestions && filteredDateOptions.length > 0 ? (
              <Box
                mt="$2"
                borderWidth={1}
                borderColor="$backgroundLight200"
                borderRadius="$md"
                bg="$white"
                maxHeight={220}
                overflow="hidden"
              >
                <ScrollView>
                  <VStack space="xs" py="$2">
                    {filteredDateOptions.map((option) => (
                      <Pressable
                        key={option.value}
                        onPress={() => handleSelectDate(option.value)}
                        sx={{ ':active': { opacity: 0.6 } }}
                      >
                        <Box px="$3" py="$2">
                          <Text
                            color={option.value === selectedDate ? MUAY_PURPLE : '$text700'}
                            fontWeight={option.value === selectedDate ? '$bold' : '$normal'}
                          >
                            {option.label}
                          </Text>
                        </Box>
                      </Pressable>
                    ))}
                  </VStack>
                </ScrollView>
              </Box>
            ) : null}
          </Box>
          <HStack space="md" alignItems="center" justifyContent="flex-end">
            <Pressable
              onPress={handleGoDailyQuiz}
              disabled={!canTakeQuiz}
              accessibilityLabel={`Go to daily quiz (${activeDate})`}
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{ alignSelf: 'flex-end', opacity: canTakeQuiz ? 1 : 0.25 }}
            >
              <HStack space="xs" alignItems="center">
                <Ionicons name="chevron-forward" size={20} color={MUAY_PURPLE} />
                <Ionicons name="reader-outline" size={33} color={MUAY_PURPLE} />
              </HStack>
            </Pressable>

            <Pressable
              onPress={handleGoReview}
              disabled={isPrefetching || !canTakeQuiz}
              accessibilityLabel={`Go to vocabulary review (${quizCount})`}
              sx={{
                ':active': { opacity: 0.6 },
              }}
              style={{
                opacity: !canTakeQuiz ? 0.25 : isPrefetching ? 0.6 : 1,
                alignSelf: 'flex-end',
              }}
            >
              <HStack space="xs" alignItems="center">
                <Ionicons name="chevron-forward" size={20} color={MUAY_PURPLE} />
                <Ionicons name="school-outline" size={33} color={MUAY_PURPLE} />
              </HStack>
            </Pressable>
          </HStack>
        </VStack>
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
        ) : !vocabularyData?.words?.length ? (
          <Box
            p="$4"
            bg="$secondary50"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$secondary100"
          >
            <Text size="md" color={MUAY_PURPLE} fontWeight="$bold">
              No daily vocabulary found
            </Text>
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
              <HStack space="xs" alignItems="center" justifyContent="space-between">
              <VStack space="xs">
                <HStack space="md" alignItems="center" justifyContent="flex-start">
                  <Center bg={MUAY_PURPLE} w="$5" h="$5" borderRadius="$full">
                    <Text size="xs" color="$white" fontWeight="$bold" fontSize={10}>
                      {index + 1}
                    </Text>
                </Center>
                  <Text fontWeight="$bold" size="lg" color={MUAY_PURPLE} fontSize={24}>
                  {item.th}
                  </Text>
                  <SpeakerButton
                    onPress={() => speak(item.th)}
                    accessibilityLabel={`Speak ${item.th}`}
                    size={20}
                    color={MUAY_PURPLE}
                  />
                </HStack>
                <Text
                  size="md"
                  color="$text500"
                  fontSize={14}
                  fontWeight="$bold"
                  textAlign="left"
                  style={{ marginLeft: 36 }}
                >
                  {item.word}
                </Text>
              </VStack>
              <Box alignSelf="flex-end">
                <Ionicons name="chevron-forward" size={24} color="$text500" />
              </Box>
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

              <Divider />

              <Box bg="$backgroundLight50" p="$4" borderRadius="$md">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="md" fontWeight="$medium" mb="$1" fontSize={28} color={MUAY_PURPLE}>
                    {selectedWord?.ex_th}
                  </Text>
                  <SpeakerButton
                    onPress={() => speak(selectedWord?.ex_th ?? '')}
                    accessibilityLabel="Speak example Thai"
                    size={26}
                    color={MUAY_PURPLE}
                  />
                </HStack>
                <Text size="sm" color="$text400" mb="$2" mt="$2">
                  EN : {selectedWord?.ex_en}
                </Text>
                <Text size="sm" color="$secondary600" mb="$2">
                  TW : {selectedWord?.ex_tw}
                </Text>
              </Box>

              <Pressable
                onPress={handleAddToMyVocabulary}
                disabled={
                  user?.isGuest || isAddingToMyVocab || alreadyInMyVocab || !selectedWord
                }
                bg={MUAY_PURPLE}
                py="$3"
                borderRadius="$lg"
                sx={{
                  ':active': { opacity: 0.85 },
                }}
                opacity={
                  user?.isGuest || isAddingToMyVocab || alreadyInMyVocab ? 0.45 : 1
                }
              >
                <Text
                  textAlign="center"
                  color="$white"
                  fontWeight="$bold"
                  size="md"
                >
                  {user?.isGuest
                    ? 'Sign in to add to My Vocabulary'
                    : alreadyInMyVocab
                      ? 'Already in My Vocabulary'
                      : isAddingToMyVocab
                        ? 'Adding…'
                        : 'Add to My Vocabulary'}
                </Text>
              </Pressable>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default DailyVocabularyList
