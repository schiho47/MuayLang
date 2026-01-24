import { Ionicons } from '@expo/vector-icons'
import React, { useState, useMemo } from 'react'
import { FlatList, View, TouchableOpacity, Text } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { Fonts } from '@/constants/theme'
import FilterVocabularyModal from '@/components/learning/FilterVocabularyModal'
import { VocabularyDataType, FilterDataType, VocabularyFieldEnum } from '@/components/learning/type'
import VocabularyCard from '@/components/learning/VocabularyCard'
import { useVocabularies } from '@/lib/learningAPI'
import { Spinner } from '@/components/ui/spinner'
import { router } from 'expo-router'
import { useUser } from '@/hooks/useUser'
import AlphabetSection from '@/components/learning/AlphabetSection'
import VowelLearningScreen from '@/components/learning/VowelLearningScreen'
import DailyVocabularyList from '@/components/learning/DailyVocabulary'
export default function TabTwoScreen() {
  const { user } = useUser()
  const { data: vocabularies, isLoading } = useVocabularies(user?.$id)
  const [openFilterSheet, setOpenFilterSheet] = useState(false)
  const [filterData, setFilterData] = useState<FilterDataType | null>(null)

  const handleAddingVocabulary = () => {
    // Prevent guests from adding
    if (user?.isGuest) {
      console.log('Guest users cannot add vocabulary')
      return
    }
    router.push('/vocabulary/add')
  }
  console.log({ vocabularies })

  const handleEditingVocabulary = (id: string) => {
    // Prevent guests from editing
    if (user?.isGuest) {
      console.log('Guest users cannot edit vocabulary')
      return
    }
    router.push(`/vocabulary/edit/${id}`)
  }

  // Filtered vocabulary list
  const filteredVocabularies = useMemo(() => {
    if (!vocabularies) return []
    if (!filterData) return vocabularies as unknown as VocabularyDataType[]

    let filtered = vocabularies as unknown as VocabularyDataType[]

    // Filter by search term
    if (
      filterData.vocabulary &&
      typeof filterData.vocabulary === 'string' &&
      filterData.vocabulary.trim()
    ) {
      const searchLower = filterData.vocabulary.toLowerCase().trim()
      filtered = filtered.filter((vocab) => {
        // Search in Thai, English and Romanization
        const thai = String(vocab[VocabularyFieldEnum.Thai] || '').toLowerCase()
        const english = String(vocab[VocabularyFieldEnum.English] || '').toLowerCase()
        const romanization = String(vocab[VocabularyFieldEnum.Romanization] || '').toLowerCase()

        return (
          thai.includes(searchLower) ||
          english.includes(searchLower) ||
          romanization.includes(searchLower)
        )
      })
    }

    // Filter by tags
    if (filterData.tags && filterData.tags.length > 0) {
      filtered = filtered.filter((vocab) => {
        const vocabTags = vocab[VocabularyFieldEnum.Tags] || []
        // Check if any selected tag is included
        return filterData.tags.some((tag) => vocabTags.includes(tag))
      })
    }

    // Filter by favorite status
    if (filterData.favorite === true) {
      filtered = filtered.filter((vocab) => vocab[VocabularyFieldEnum.Favorite] === true)
    }

    return filtered
  }, [vocabularies, filterData])

  const handleConfirmFilteringVocabulary = (filterDataInput: FilterDataType) => {
    console.log('Filter data:', filterDataInput)
    setFilterData(filterDataInput)
    setOpenFilterSheet(false)
  }

  const handleClearFilter = () => {
    setFilterData(null)
  }

  // Check if there are active filter conditions
  const hasActiveFilter = useMemo(() => {
    if (!filterData) return false
    const hasVocabulary =
      filterData.vocabulary &&
      typeof filterData.vocabulary === 'string' &&
      filterData.vocabulary.trim()
    const hasTags = filterData.tags && filterData.tags.length > 0
    const hasFavorite = filterData.favorite === true
    return !!(hasVocabulary || hasTags || hasFavorite)
  }, [filterData])
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: MUAY_PURPLE, dark: '#353636' }}
        headerOverflow="visible"
        headerImage={
          <View className="flex-1 justify-center items-center relative">
            <View className="absolute bottom-0 left-0 right-0 items-center justify-center">
              <Text
                className="text-[130px] leading-[250px] font-bold text-center"
                style={{
                  fontFamily: Fonts.rounded,
                  color: MUAY_WHITE,
                }}
              >
                ไทย
              </Text>
            </View>
            <IconSymbol
              name="book.fill"
              size={52}
              color={MUAY_WHITE}
              style={{
                position: 'absolute',
                bottom: 30,
                right: 20,
              }}
            />
          </View>
        }
      >
        {/* Learning Content */}



        <View className="mb-2.5 w-full h-[1.5px]" style={{ backgroundColor: MUAY_PURPLE }} />

        {/* Filter conditions display */}
        {hasActiveFilter && (
          <View className="px-4 py-2">
            <View
              className="flex-row items-center py-2 px-3 rounded-[20px] self-start"
              style={{ backgroundColor: MUAY_PURPLE }}
            >
              <Ionicons name="funnel" size={14} color={MUAY_WHITE} className="mr-1" />
              <Text className="text-sm font-semibold" style={{ color: MUAY_WHITE }}>
                {filteredVocabularies.length} /{' '}
                {(vocabularies as unknown as VocabularyDataType[])?.length || 0} words
              </Text>
              <TouchableOpacity onPress={handleClearFilter} className="ml-2">
                <Ionicons name="close-circle" size={16} color={MUAY_WHITE} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading && (
          <View className="flex-1 justify-center items-center py-10">
            <Spinner />
          </View>
        )}
        <DailyVocabularyList />
        <View className="flex-row justify-end items-center px-4">
          <View className="flex-row items-center gap-2">
            {!user?.isGuest && (
              <Ionicons
                name="add-circle"
                size={33}
                color={MUAY_PURPLE}
                onPress={handleAddingVocabulary}
                className="p-1"
              />
            )}
            <Ionicons
              name={hasActiveFilter ? 'filter' : 'filter-outline'}
              size={33}
              color={MUAY_PURPLE}
              onPress={() => {
                console.log('Filtering vocabulary')
                setOpenFilterSheet(true)
              }}
              className="p-1"
            />
          </View>
        </View>
        {!isLoading && (
          <FlatList
            data={filteredVocabularies}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerClassName="px-4 gap-3"
            ListEmptyComponent={
              <Text className="text-center text-base text-[#666] py-10">
                {hasActiveFilter ? 'No matching vocabulary found' : 'No vocabulary data'}
              </Text>
            }
            keyExtractor={(item: VocabularyDataType) => item.$id}
            renderItem={({ item }: { item: VocabularyDataType }) => (
              <VocabularyCard
                onPress={() => {
                  handleEditingVocabulary(item.$id)
                }}
                id={item.$id}
                item={item}
              />
            )}
          />
        )}
        <View style={{ paddingHorizontal: 8 }}>
          <AlphabetSection />
        </View>
        <View style={{ paddingHorizontal: 8 }}>
          <VowelLearningScreen />
        </View>
      </ParallaxScrollView>

      <FilterVocabularyModal
        isOpen={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        handleConfirmAction={handleConfirmFilteringVocabulary}
        vocabularies={(vocabularies as unknown as VocabularyDataType[]) || []}
      />
    </>
  )
}
