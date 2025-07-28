import React, { useState } from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import {
  FilterDataType,
  VocabularyDataType,
  VocabularyFieldEnum,
} from '../../components/learning/type'
import VocabularyCard from '../../components/learning/VocabularyCard'
import Spacer from '../../components/Spacer'
import {
  useGetVocabularyByFilter,
  useGetVocabularyById,
  useVocabularies,
} from '../../lib/learningAPI'

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import FilterVocabularyModal from '../../components/learning/FilterVocabularyModal.'
import { MUAY_PURPLE } from '../../constants/Colors'
import { Divider } from 'react-native-paper'
import FilterVocabularyDrawer from '@/components/learning/FilterVocabularyDrawer'

const Learning = () => {
  const [openFilterModal, setOpenFilterModal] = useState(false)

  const { data: vocabularies, isLoading, refetch } = useVocabularies()

  const {
    data: filteredVocabularies,
    isLoading: isLoadingFilteredVocabularies,
    refetch: refetchFilteredVocabularies,
  } = useGetVocabularyByFilter({}, { onSettled: () => setOpenFilterModal(false) })
  const handleAddingVocabulary = () => {
    router.push('/vocabulary/add')
  }
  const handleEditingVocabulary = (id: string) => {
    router.push(`/vocabulary/edit/${id}`)
  }
  const handleFilteringVocabulary = () => {
    setOpenFilterModal(true)
  }
  const handleConfirmFilteringVocabulary = (filterData: FilterDataType) => {
    console.log(filterData)

    refetchFilteredVocabularies(filterData)
  }

  return (
    <View className="flex-1">
      <Text style={{ fontSize: 36, margin: 16, color: MUAY_PURPLE }} className="px-6 mt-4">
        Learning
      </Text>
      <Divider />

      <View
        className="flex-row justify-between items-center w-full px-6 mt-4 "
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingHorizontal: 16,
          marginTop: 16,
        }}
      >
        <Text style={{ fontSize: 24, marginLeft: 16 }}>Vocabulary</Text>
        <View
          className="flex-row items-center gap-2 text-muay-purple"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            color: MUAY_PURPLE,
          }}
        >
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
      {openFilterModal && (
        <FilterVocabularyDrawer
          visible={openFilterModal}
          onClose={() => setOpenFilterModal(false)}
          handleConfirmAction={handleConfirmFilteringVocabulary}
          vocabularies={vocabularies || []}
        />
      )}
      {isLoading && <ActivityIndicator animating={true} color={MUAY_PURPLE} />}
      {!isLoading && (
        <FlatList
          data={
            filteredVocabularies && (filteredVocabularies as VocabularyDataType).$id
              ? [filteredVocabularies as VocabularyDataType]
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
      {/* {openFilterModal && (
            <FilterVocabularyModal
              handleClose={() => setOpenFilterModal(false)}
              handleConfirm={() => {}}
              vocabularies={(vocabularies as unknown as VocabularyDataType[]) || []}
            />
          )} */}
    </View>
  )
}

export default Learning
