import { router, useLocalSearchParams } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { VocabularyDetailDataType, VocabularyFieldEnum } from '../../../components/learning/type'
import VocabularySetting from '../../../components/learning/VocabularySetting'
import { MUAY_PURPLE } from '../../../constants/Colors'
import { useGetVocabularyById } from '../../../lib/learningAPI'

const initialModalDataType: VocabularyDetailDataType = {
  $id: '',
  thai: '',
  romanization: '',
  english: '',
  exampleTH: '',
  exampleEN: '',
  note: '',
  url: '',
  tags: [],
}

const EditVocabulary = () => {
  const { id } = useLocalSearchParams()

  const { data: vocabulary, isLoading } = useGetVocabularyById(id as string, {
    enabled: !!id,
    select: (data: any) => {
      // 明確提取我們需要的欄位，包括 $id 用於更新操作
      return {
        $id: data.$id, // 保留 $id 用於更新時的文檔識別
        thai: data.thai || '',
        romanization: data.romanization || '',
        english: data.english || '',
        exampleTH: data.exampleTH || '',
        exampleEN: data.exampleEN || '',
        note: data.note || '',
        url: data.url || null,
        tags: data.tags || [],
      }
    },
  })
  const [pageData, setPageData] = useState<VocabularyDetailDataType>(initialModalDataType)

  const handleChangePageData = (value: string | string[], name: VocabularyFieldEnum) => {
    console.log({ value, name })
    setPageData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (vocabulary) {
      setPageData(vocabulary)
    }
  }, [vocabulary])
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
                <Text
                  className="text-[28px] font-bold text-muay-purple mb-2 mt-4"
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: MUAY_PURPLE,
                    marginBottom: 8,
                    marginTop: 16,
                  }}
                >
                  Edit Vocabulary
                </Text>
              }
            />
          </Appbar.Header>
          <VocabularySetting
            handleBack={() => {
              router.back()
            }}
            handleDelete={() => {
              console.log('delete')
            }}
            pageData={pageData || initialModalDataType}
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
