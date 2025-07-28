import {
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Keyboard,
} from 'react-native'
import React, { useState } from 'react'
import ModalFooter from '../../components/ModalFooter'
import { MaterialIcons } from '@expo/vector-icons'
import CustomInput from '../../components/CustomInputOld'
import { VocabularyDetailDataType, VocabularyFieldEnum } from '../../components/learning/type'
import Spacer from '../../components/Spacer'
import { useAddVocabulary } from '../../lib/learningAPI'
import { validators } from '../../utils/validators'
import Accordion from '../../components/Accordion'
import ExampleAndNote from '../../components/learning/ExampleAndNote'
import { Appbar } from 'react-native-paper'
import { router } from 'expo-router'
import VocabularySetting from '../../components/learning/VocabularySetting'
import { MUAY_PURPLE } from '@/constants/Colors'
type AddVocabularyModalProps = {}

const initialModalDataType = {
  thai: '',
  romanization: '',
  english: '',
  exampleEN: '',
  exampleTH: '',
  note: '',
  tag: [],
}

const AddVocabulary = (props: AddVocabularyModalProps) => {
  const { mutate: addVocabulary } = useAddVocabulary()
  const [pageData, setPageData] = useState<VocabularyDetailDataType>(initialModalDataType)
  const handleChangePageData = (value: string, name: VocabularyFieldEnum) => {
    setPageData((prev) => ({ ...prev, [name]: value }))
  }
  return (
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
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: MUAY_PURPLE,
                marginBottom: 8,
                marginTop: 16,
              }}
            >
              Add Vocabulary
            </Text>
          }
        />
      </Appbar.Header>
      <VocabularySetting
        handleBack={() => {
          router.back()
        }}
        handleConfirm={() => {}}
        pageData={pageData || initialModalDataType}
        handleChangePageData={handleChangePageData}
        isEdit={false}
      />
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="flex-1 justify-center items-center bg-black/40">
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1, width: '100%' }}
              keyboardVerticalOffset={64}
            > */}
      {/* <View className="bg-white rounded-2xl shadow-lg items-center relative p-5 w-full overflow-x-hidden"> */}

      {/* </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback> */}
    </View>
  )
}

export default AddVocabulary

const styles = StyleSheet.create({})
