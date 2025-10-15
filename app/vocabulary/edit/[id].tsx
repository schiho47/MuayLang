import { router, useLocalSearchParams } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
// @ts-ignore - types for components may not be bundled correctly
import { Box, HStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { VocabularyDetailDataType, VocabularyFieldEnum } from '../../../components/learning/type'
import VocabularySetting from '../../../components/learning/VocabularySetting'
import { MUAY_PURPLE, MUAY_WHITE } from '../../../constants/Colors'
import { useGetVocabularyById } from '../../../lib/learningAPI'

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
        url: data.url || '',
        tags: data.tags || [],
      }
    },
  })
  const [pageData, setPageData] = useState<VocabularyDetailDataType | null>(null)

  const handleChangePageData = (value: string | string[], name: VocabularyFieldEnum) => {
    console.log({ value, name })
    setPageData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  useEffect(() => {
    if (vocabulary) {
      setPageData(vocabulary)
    }
  }, [vocabulary])

  return (
    <>
      {(isLoading || !pageData) && (
        <ActivityIndicator animating={true} color={MUAY_PURPLE} style={{ marginTop: 100 }} />
      )}
      {!isLoading && pageData && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Box
            style={{
              backgroundColor: MUAY_WHITE,
              paddingTop: 44,
              paddingBottom: 8,
              paddingHorizontal: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <HStack style={{ alignItems: 'center', paddingHorizontal: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  router.back()
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="arrow-back" size={24} color={MUAY_PURPLE} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: MUAY_PURPLE,
                  padding: 24,
                  paddingLeft: 40,
                }}
              >
                Edit Vocabulary
              </Text>
            </HStack>
          </Box>
          <VocabularySetting
            handleBack={() => {
              router.back()
            }}
            handleDelete={() => {
              console.log('delete')
            }}
            pageData={pageData}
            handleChangePageData={handleChangePageData}
            isEdit={true}
          />
        </KeyboardAvoidingView>
      )}
    </>
  )
}

export default EditVocabulary
