import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { VocabularyDetailDataType, VocabularyFieldEnum } from '../../../components/learning/type'
import VocabularySetting from '../../../components/learning/VocabularySetting'
import { MUAY_PURPLE } from '../../../constants/Colors'
import { useGetVocabularyById } from '../../../lib/learningAPI'

const initialModalDataType = {
  thai: '',
  romanization: '',
  english: '',
  exampleTH: '',
  exampleEN: '',
  note: '',
  tag: [],
}
const EditVocabulary = () => {
  const { id } = useLocalSearchParams()
  console.log({ id })
  const { data: vocabulary, isLoading } = useGetVocabularyById(id as string, {
    enabled: !!id,
  })
  const [pageData, setPageData] = useState<VocabularyDetailDataType>(initialModalDataType)
  const handleChangePageData = (value: string, name: VocabularyFieldEnum) => {
    setPageData((prev) => ({ ...prev, [name]: value }))
  }
  return (
    <>
      {isLoading && <ActivityIndicator animating={true} color={MUAY_PURPLE} />}
      {!isLoading && (
        <View className="flex-1">
          <Appbar.Header>
            <Appbar.BackAction
              onPress={() => {
                router.back()
              }}
            />
            <Appbar.Content
              title={
                <Text className="text-[28px] font-bold text-muay-purple mb-2 mt-4">
                  Edit Vocabulary
                </Text>
              }
            />
          </Appbar.Header>
          <VocabularySetting
            handleDelete={() => {
              console.log('delete')
            }}
            handleConfirm={() => {}}
            pageData={vocabulary || initialModalDataType}
            handleChangePageData={handleChangePageData}
            isEdit={true}
          />
        </View>
      )}
    </>
  )
}

export default EditVocabulary

const styles = StyleSheet.create({})
