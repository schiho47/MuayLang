import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomInput from '../CustomInputOld'
import Spacer from '../Spacer'
import Accordion from '../Accordion'
import ModalFooter from '../ModalFooter'
import { CheckModalError, ModalDataType, VocabularyFieldEnum } from './type'
import ExampleAndNote from './ExampleAndNote'
import { validators } from '../../utils/validators'

import { useAddVocabulary } from './api'

type AddVocabularyModalProps = {
  handleClose: (isUpdate: boolean) => void
}

type CheckErrorKey = keyof CheckModalError
const initialModalDataType = {
  thai: '',
  romanization: '',
  english: '',
  exampleEN: '',
  exampleTH: '',
}
const isRequiredFields = [
  VocabularyFieldEnum.Thai,
  VocabularyFieldEnum.Romanization,
  VocabularyFieldEnum.English,
]

const AddVocabularyModal: React.FC<AddVocabularyModalProps> = (props) => {
  const { handleClose } = props
  const { mutate: addVocabulary } = useAddVocabulary()
  const [modalData, setModalData] = useState<ModalDataType>(initialModalDataType)
  const [accordionStatus, setAccordionStatus] = useState({
    example: false,
    notification: false,
  })
  const [checkError, setCheckError] = useState<CheckModalError>({
    [VocabularyFieldEnum.Thai]: { status: false, message: '' },
    [VocabularyFieldEnum.Romanization]: { status: false, message: '' },
    [VocabularyFieldEnum.English]: { status: false, message: '' },
    [VocabularyFieldEnum.EnglishExample]: { status: false, message: '' },
    [VocabularyFieldEnum.ThaiExample]: { status: false, message: '' },
  })

  const handleChange = (value: string, name: VocabularyFieldEnum) => {
    let isError = { status: false, message: '' }

    if (!value && isRequiredFields.includes(name)) {
      isError = { status: true, message: '* This is a required field' }
    } else if (validators[name]) {
      const valid = validators[name].validate(value)
      isError = { status: !valid, message: valid ? '' : validators[name].message }
    }

    setCheckError((prev) => ({ ...prev, [name]: isError }))
    setModalData((prev) => ({ ...prev, [name]: value.toLowerCase() }))
  }

  const handleConfirm = () => {
    const newError = {} as CheckModalError
    for (const key in modalData) {
      if (!modalData[key as keyof ModalDataType]) {
        newError[key as CheckErrorKey] = { status: true, message: '* This is a required field' }
      }
    }
    setCheckError((prev) => ({ ...prev, ...newError }))
    console.log({ modalData })
    handleSaveData()
  }

  const handleSaveData = () => {
    addVocabulary(modalData, {
      onSettled: () => handleClose(true),
    })
  }
  //   const handleGetRomanization = async () => {
  //     console.log({ modalData })
  //     try {
  //       const res = await fetch('http://192.168.0.101:3000/transliterate', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ text: modalData.thai }),
  //       })

  //       console.log('response status:', res.status)
  //       const data = await res.json()
  //       console.log({ data })
  //     } catch (e) {
  //       console.log('fetch error:', e)
  //     }
  //   }
  //   const handleAutoGenerate = () => {
  //     if (!modalData.thai) {
  //       setCheckError((prev) => ({ ...prev, thai: true }))
  //       return
  //     }
  //     handleGetRomanization()
  //   }
  return (
    <Modal
      animationType="slide"
      transparent
      visible={true}
      onRequestClose={() => handleClose(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View className="flex-1 justify-center items-center bg-black/40">
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1, width: '100%' }}
              keyboardVerticalOffset={64}
            >
              <View className="bg-white rounded-2xl shadow-lg items-center relative p-5 w-full overflow-x-hidden">
                <ScrollView>
                  <TouchableOpacity
                    onPress={() => handleClose(false)}
                    className="absolute top-1 right-1 p-2 z-10"
                    hitSlop={10}
                  >
                    <MaterialIcons name="close" size={22} color="#6B3789" />
                  </TouchableOpacity>
                  <Text className="text-[28px] font-bold text-muay-purple mb-2 mt-4">
                    Add Vocabulary
                  </Text>

                  <CustomInput
                    title={'Thai'}
                    placeholder="Enter Thai"
                    value={modalData.thai}
                    name={VocabularyFieldEnum.Thai}
                    onChange={(value, name) => handleChange(value, name)}
                    error={checkError[VocabularyFieldEnum.Thai].status}
                    errorMessage={checkError[VocabularyFieldEnum.Thai].message}
                  />

                  <CustomInput
                    title={'Romanization'}
                    //   action={{ title: 'Auto-generate', onPress: handleAutoGenerate }}
                    placeholder="Enter Romanization"
                    value={modalData.romanization}
                    name={VocabularyFieldEnum.Romanization}
                    onChange={(value, name) => handleChange(value, name)}
                    error={checkError[VocabularyFieldEnum.Romanization].status}
                    errorMessage={checkError[VocabularyFieldEnum.Romanization].message}
                  />

                  <CustomInput
                    title={'English'}
                    placeholder="Enter English"
                    value={modalData.english}
                    name={'english'}
                    onChange={(value, name) => handleChange(value, name)}
                    error={checkError[VocabularyFieldEnum.English].status}
                    errorMessage={checkError[VocabularyFieldEnum.English].message}
                  />
                  <Spacer height={10} />
                  <Accordion
                    title={'Example Sentence And Note (optional)'}
                    children={
                      <ExampleAndNote onChange={(value, name) => handleChange(value, name)} />
                    }
                    expanded={accordionStatus.example}
                    onToggle={() =>
                      setAccordionStatus((prev) => ({ ...prev, example: !prev.example }))
                    }
                  />

                  <Accordion
                    title={'Push notification (optional)'}
                    children={undefined}
                    expanded={accordionStatus.notification}
                    onToggle={() =>
                      setAccordionStatus((prev) => ({ ...prev, notification: !prev.notification }))
                    }
                  />
                  <Spacer height={20} />
                  <ModalFooter
                    handleClose={() => handleClose(false)}
                    handelConfirm={handleConfirm}
                  />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default AddVocabularyModal
