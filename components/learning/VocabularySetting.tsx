import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { VocabularyDetailDataType, VocabularyFieldEnum } from './type'
import { CheckModalError } from './type'

import Spacer from '../Spacer'
import Accordion from '../Accordion'
import ExampleAndNote from './ExampleAndNote'
import { router } from 'expo-router'
import ModalFooter from '../ModalFooter'
import { useAddVocabulary } from '../../lib/learningAPI'
import { validators } from '../../utils/validators'
import DeleteDialog from '../DeleteDialog'
import CustomInput from '../CustomInput'

type CheckErrorKey = keyof CheckModalError
const isRequiredFields = [
  VocabularyFieldEnum.Thai,
  VocabularyFieldEnum.Romanization,
  VocabularyFieldEnum.English,
]

type VocabularySettingProps = {
  handleBack: () => void
  handleConfirm: () => void
  handleDelete?: () => void
  pageData: VocabularyDetailDataType
  handleChangePageData: (value: string, name: VocabularyFieldEnum) => void
  isEdit: boolean
}

const VocabularySetting = (props: VocabularySettingProps) => {
  const { handleBack, pageData, handleChangePageData, isEdit, handleDelete = () => {} } = props
  console.log({ pageData })
  const [accordionStatus, setAccordionStatus] = useState({
    example: false,
    notification: false,
  })
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)

  const { mutate: addVocabulary } = useAddVocabulary()

  const [checkError, setCheckError] = useState<CheckModalError>({
    [VocabularyFieldEnum.Thai]: { status: false, message: '' },
    [VocabularyFieldEnum.Romanization]: { status: false, message: '' },
    [VocabularyFieldEnum.English]: { status: false, message: '' },
    [VocabularyFieldEnum.EnglishExample]: { status: false, message: '' },
    [VocabularyFieldEnum.ThaiExample]: { status: false, message: '' },
    [VocabularyFieldEnum.URL]: { status: false, message: '' },
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
    handleChangePageData(value.toLowerCase(), name)
  }

  const handleConfirm = () => {
    const newError = {} as CheckModalError
    for (const key in pageData || {}) {
      if (!pageData[key as keyof VocabularyDetailDataType]) {
        newError[key as CheckErrorKey] = { status: true, message: '* This is a required field' }
      }
    }
    setCheckError((prev) => ({ ...prev, ...newError }))
    return
    console.log({ pageData })
    handleSaveData()
  }

  const handleSaveData = () => {
    if (isEdit) {
      console.log('edit')
    } else {
      addVocabulary(pageData, {
        onSettled: () => handleBack(),
      })
    }
  }

  const handleDeleteVocabulary = () => {
    setDeleteDialogVisible(true)
    handleDelete()
    handleBack()
  }

  return (
    <View className="flex-1 mt-5">
      <ScrollView>
        <CustomInput
          title={'Thai'}
          placeholder="Enter Thai"
          value={pageData?.thai}
          name={VocabularyFieldEnum.Thai}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.Thai].status}
          errorMessage={checkError[VocabularyFieldEnum.Thai].message}
        />

        <CustomInput
          title={'Romanization'}
          //   action={{ title: 'Auto-generate', onPress: handleAutoGenerate }}
          placeholder="Enter Romanization"
          value={pageData?.romanization}
          name={VocabularyFieldEnum.Romanization}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.Romanization].status}
          errorMessage={checkError[VocabularyFieldEnum.Romanization].message}
        />

        <CustomInput
          title={'English'}
          placeholder="Enter English"
          value={pageData?.english}
          name={'english'}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.English].status}
          errorMessage={checkError[VocabularyFieldEnum.English].message}
        />
        <Spacer height={10} />
        <Accordion
          title={'Example Sentence And Note (optional)'}
          children={
            <ExampleAndNote
              onChange={(value, name) => handleChange(value, name)}
              value={{
                exampleTH: pageData?.exampleTH || '',
                exampleEN: pageData?.exampleEN || '',
                note: pageData?.note || '',
                url: pageData?.url || '',
              }}
            />
          }
          expanded={accordionStatus.example}
          onToggle={() => setAccordionStatus((prev) => ({ ...prev, example: !prev.example }))}
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
          handleBack={() => {
            router.back()
          }}
          handelConfirm={handleConfirm}
          isEdit={isEdit}
          handleDelete={() => {
            console.log('delete')
          }}
        />
      </ScrollView>
      <DeleteDialog
        visible={deleteDialogVisible}
        hideDialog={() => setDeleteDialogVisible(false)}
        handleDelete={handleDeleteVocabulary}
      />
    </View>
  )
}

export default VocabularySetting

const styles = StyleSheet.create({})
