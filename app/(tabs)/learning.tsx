import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { Fonts } from '@/constants/theme'

// Learning components

// Types and hooks
import { VocabularyDataType } from '@/components/learning/type'
import VocabularyCard from '@/components/learning/VocabularyCard'
import { useVocabularies } from '@/lib/learningAPI'
import { Divider, Spinner } from '@gluestack-ui/themed'
import { router } from 'expo-router'

export default function TabTwoScreen() {
  const { data: vocabularies, isLoading } = useVocabularies()

  const handleAddingVocabulary = () => {
    router.push('/vocabulary/add')
  }
  console.log({ vocabularies })

  const handleEditingVocabulary = (id: string) => {
    router.push(`/vocabulary/edit/${id}`)
    // Alert.alert('Edit Vocabulary', 'Edit vocabulary functionality will be implemented')
  }
  return (
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
            name="filter"
            size={33}
            color={MUAY_PURPLE}
            onPress={() => Alert.alert('Filter', 'Filter functionality will be implemented')}
            style={styles.actionIcon}
          />
        </View>
      </ThemedView>

      <Divider mb={10} bgColor={MUAY_PURPLE} w="100%" h={1.5} />
      {/* 
      {openFilterModal && (
        <FilterVocabularyDrawer
          visible={openFilterModal}
          onClose={() => setOpenFilterModal(false)}
          handleConfirmAction={handleConfirmFilteringVocabulary}
          vocabularies={vocabularies || []}
        />
      )} */}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Spinner />
        </View>
      )}

      {!isLoading && (
        <FlatList
          data={(vocabularies as unknown as VocabularyDataType[]) || []}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<ThemedText style={styles.emptyText}>No vocabulary data</ThemedText>}
          keyExtractor={(item: VocabularyDataType) => item.$id}
          renderItem={({ item }: { item: VocabularyDataType }) => (
            <VocabularyCard
              onPress={() => {
                handleEditingVocabulary(item.$id)
              }}
              id={item.$id}
              item={item}
              // id={item.$id}
              // thai={item[VocabularyFieldEnum.Thai]}
              // romanization={item[VocabularyFieldEnum.Romanization]}
              // english={item[VocabularyFieldEnum.English]}
              // tag={item[VocabularyFieldEnum.Tags]?.join(', ') || ''}
              // onPress={() => {
              //   handleEditingVocabulary(item.$id);
              // }}
            />
          )}
        />
      )}
    </ParallaxScrollView>
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
})
