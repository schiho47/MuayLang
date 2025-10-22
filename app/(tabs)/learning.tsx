import { Ionicons } from '@expo/vector-icons'
import React, { useState, useMemo } from 'react'
import { FlatList, StyleSheet, View, TouchableOpacity, Text } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { Fonts } from '@/constants/theme'

// Learning components
import FilterVocabularyModal from '@/components/learning/FilterVocabularyModal'

// Types and hooks
import { VocabularyDataType, FilterDataType, VocabularyFieldEnum } from '@/components/learning/type'
import VocabularyCard from '@/components/learning/VocabularyCard'
import { useVocabularies } from '@/lib/learningAPI'
import { Divider, Spinner } from '@gluestack-ui/themed'
import { router } from 'expo-router'
import { useUser } from '@/hooks/useUser'

export default function TabTwoScreen() {
  const { user } = useUser()
  const { data: vocabularies, isLoading } = useVocabularies(user?.$id)
  const [openFilterSheet, setOpenFilterSheet] = useState(false)
  const [filterData, setFilterData] = useState<FilterDataType | null>(null)

  const handleAddingVocabulary = () => {
    router.push('/vocabulary/add')
  }
  console.log({ vocabularies })

  const handleEditingVocabulary = (id: string) => {
    router.push(`/vocabulary/edit/${id}`)
  }

  // 篩選後的單字列表
  const filteredVocabularies = useMemo(() => {
    if (!vocabularies) return []
    if (!filterData) return vocabularies as unknown as VocabularyDataType[]

    let filtered = vocabularies as unknown as VocabularyDataType[]

    // 根據搜尋詞篩選
    if (
      filterData.vocabulary &&
      typeof filterData.vocabulary === 'string' &&
      filterData.vocabulary.trim()
    ) {
      const searchLower = filterData.vocabulary.toLowerCase().trim()
      filtered = filtered.filter((vocab) => {
        // 搜尋泰文、英文和羅馬拼音
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

    // 根據標籤篩選
    if (filterData.tags && filterData.tags.length > 0) {
      filtered = filtered.filter((vocab) => {
        const vocabTags = vocab[VocabularyFieldEnum.Tags] || []
        // 檢查是否包含任意一個選中的標籤
        return filterData.tags.some((tag) => vocabTags.includes(tag))
      })
    }

    // 根據收藏狀態篩選
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

  // 檢查是否有活躍的篩選條件
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
          <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
              <ThemedText type="title" style={styles.headerIcon}>
                ไทย
              </ThemedText>
            </View>
            <IconSymbol name="book.fill" size={52} color={MUAY_WHITE} style={styles.bookIcon} />
          </View>
        }
      >
        {/* Learning Content */}

        <ThemedView style={styles.vocabularyHeader}>
          {/* <ThemedText style={styles.vocabularyTitle}>Vocabulary</ThemedText> */}
          <View style={styles.actionButtons}>
            <Ionicons
              name="add-circle"
              size={33}
              color={MUAY_PURPLE}
              onPress={handleAddingVocabulary}
              style={styles.actionIcon}
            />
            <Ionicons
              name={hasActiveFilter ? 'filter' : 'filter-outline'}
              size={33}
              color={hasActiveFilter ? MUAY_PURPLE : MUAY_PURPLE}
              onPress={() => {
                console.log('Filtering vocabulary')
                setOpenFilterSheet(true)
              }}
              style={styles.actionIcon}
            />
          </View>
        </ThemedView>

        <Divider mb={10} bgColor={MUAY_PURPLE} w="100%" h={1.5} />

        {/* 篩選條件顯示 */}
        {hasActiveFilter && (
          <View style={styles.filterBadgeContainer}>
            <View style={styles.filterBadge}>
              <Ionicons name="funnel" size={14} color={MUAY_WHITE} style={{ marginRight: 4 }} />
              <Text style={styles.filterBadgeText}>
                {filteredVocabularies.length} /{' '}
                {(vocabularies as unknown as VocabularyDataType[])?.length || 0} words
              </Text>
              <TouchableOpacity onPress={handleClearFilter} style={{ marginLeft: 8 }}>
                <Ionicons name="close-circle" size={16} color={MUAY_WHITE} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Spinner />
          </View>
        )}

        {!isLoading && (
          <FlatList
            data={filteredVocabularies}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                {hasActiveFilter ? 'No matching vocabulary found' : 'No vocabulary data'}
              </ThemedText>
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

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    transform: [{ rotate: '-5deg' }],
    fontFamily: Fonts.rounded,
    fontSize: 130,
    lineHeight: 250,
    fontWeight: 'bold',
    color: MUAY_WHITE,
    textAlign: 'center',
  },
  bookIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    transform: [{ rotate: '-5deg' }],
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // vocabularyTitle: {
  //   fontSize: 24,
  //   fontWeight: '600',
  //   color: '#333',
  // },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    paddingVertical: 40,
  },
  filterBadgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MUAY_PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  filterBadgeText: {
    color: MUAY_WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
})
