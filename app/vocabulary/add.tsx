import { Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'

import { VocabularyDetailDataType, VocabularyFieldEnum } from '../../components/learning/type'

// @ts-ignore - types for components may not be bundled correctly
import { Box, HStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import VocabularySetting from '../../components/learning/VocabularySetting'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

const initialModalDataType: VocabularyDetailDataType = {
  $id: '',
  thai: '',
  romanization: '',
  english: '',
  exampleEN: '',
  exampleTH: '',
  note: '',
  url: '',
  tags: [],
}

const AddVocabulary = () => {
  const [pageData, setPageData] = useState<VocabularyDetailDataType>(initialModalDataType)
  const handleChangePageData = (value: string | string[], name: VocabularyFieldEnum) => {
    setPageData((prev) => ({ ...prev, [name]: value }))
  }
  return (
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
            Add Vocabulary
          </Text>
        </HStack>
      </Box>
      <VocabularySetting
        handleBack={() => {
          router.back()
        }}
        pageData={pageData || initialModalDataType}
        handleChangePageData={handleChangePageData}
        isEdit={false}
      />
    </KeyboardAvoidingView>
  )
}

export default AddVocabulary
