import React, { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Text,
  View
} from 'react-native'
import { VocabularyDataType, VocabularyFieldEnum } from '../../components/learning/type'
import VocabularyCard from '../../components/learning/VocabularyCard'
import Spacer from '../../components/Spacer'
import { useGetVocabularyById, useVocabularies } from '../../lib/learningAPI'

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import FilterVocabularyModal from '../../components/learning/FilterVocabularyModal.'
import { MUAY_PURPLE } from '../../constants/Colors'

const Learning = () => {
  const [openFilterModal, setOpenFilterModal] = useState(false)

  const { data: vocabularies, isLoading, refetch } = useVocabularies()
  const { data: currentVocabulary, refetch: refetchCurrentVocabulary } = useGetVocabularyById('', ''  )
  const handleAddingVocabulary = () => {
    router.push('/vocabulary/add')
  }
  const handleEditingVocabulary = (id: string) => {
    router.push(`/vocabulary/edit/${id}`)
  }
  const handleFilteringVocabulary = () => {
    setOpenFilterModal(true)
  }

  return (
    <View className="flex-1">
      <Text style={{ fontSize: 42 }} className="px-6 mt-4">
        Learning
      </Text>
      <Spacer />
      <View className="flex-row justify-between items-center w-full px-6 mt-4 ">
        <Text style={{ fontSize: 24 }}>Vocabulary</Text>
        <View className="flex-row items-center gap-2 text-muay-purple">
          <Ionicons
            className="me-5"
            name="add-circle"
            size={33}
            color={MUAY_PURPLE}
            onPress={handleAddingVocabulary}
          />
          <Ionicons
            name="filter"
            size={33}
            color={MUAY_PURPLE}
            onPress={handleFilteringVocabulary}
          />
        </View>
      </View>

      <Spacer />
      {isLoading && <ActivityIndicator animating={true} color={MUAY_PURPLE} />}
      {!isLoading && (
        <FlatList
          data={
            currentVocabulary && (currentVocabulary as VocabularyDataType).$id
              ? [currentVocabulary as VocabularyDataType]
              : (vocabularies as VocabularyDataType[] | undefined)
          }
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            gap: 12,
          }}
          ListEmptyComponent={<Text>No data</Text>}
          keyExtractor={(item: VocabularyDataType) => item.$id}
          renderItem={({ item }: { item: VocabularyDataType }) => (
            <VocabularyCard
              id={item.$id}
              thai={item[VocabularyFieldEnum.Thai]}
              romanization={item[VocabularyFieldEnum.Romanization]}
              english={item[VocabularyFieldEnum.English]}
              onPress={() => {
                handleEditingVocabulary(item.$id)
              }}
            />
          )}
        />
      )}
      {openFilterModal && (
        <FilterVocabularyModal
          handleClose={() => setOpenFilterModal(false)}
          handleConfirm={() => {}}
          vocabularies={(vocabularies as unknown as VocabularyDataType[]) || []}
        />
      )}
    </View>
  )
}

export default Learning
