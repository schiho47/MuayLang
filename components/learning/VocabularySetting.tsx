import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { VocabularyDetailDataType, VocabularyFieldEnum, CheckModalError } from './type'
import CustomURL from '../CustomURL'
import Spacer from '../Spacer'

import ExampleAndNote from './ExampleAndNote'
import { router } from 'expo-router'
import ModalFooter from '../ModalFooter'
import { useAddVocabulary } from '../../lib/learningAPI'
import { validators } from '../../utils/validators'
import DeleteDialog from '../DeleteDialog'
import CustomInput from '../CustomInput'
import CustomMultiSelect from '../CustomMultiSelect'
import { updateVocabulary } from '@/lib/appwrite'
import useGetTagList from '@/hooks/useGetTagList'
import CustomAccordion from '../CustomAccordion'

type CheckErrorKey = keyof CheckModalError
const isRequiredFields = [
  VocabularyFieldEnum.Thai,
  VocabularyFieldEnum.Romanization,
  VocabularyFieldEnum.English,
]

type VocabularySettingProps = {
  handleBack: () => void
  handleDelete?: () => void
  pageData: VocabularyDetailDataType
  handleChangePageData: (value: string | string[], name: VocabularyFieldEnum) => void
  isEdit: boolean
}

const VocabularySetting = (props: VocabularySettingProps) => {
  const { handleBack, pageData, handleChangePageData, isEdit, handleDelete = () => {} } = props
  const { tagsList } = useGetTagList()

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

    console.log({ pageData })
    handleSaveData()
  }

  const handleSaveData = () => {
    if (isEdit) {
      if (!pageData.$id) {
        console.error('No vocabulary ID provided for update')
        return
      }
      console.log('Updating vocabulary with ID:', pageData.$id)
      // 排除所有系統欄位（以 $ 開頭的欄位）
      const updateData = Object.fromEntries(
        Object.entries(pageData).filter(([key]) => !key.startsWith('$'))
      )
      updateVocabulary(pageData.$id, updateData, {
        onSettled: () => handleBack(),
      })
    } else {
      // 新增時也要排除系統欄位
      const createData = Object.fromEntries(
        Object.entries(pageData).filter(([key]) => !key.startsWith('$'))
      )
      addVocabulary(createData, {
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
    // <ScrollView className="flex-1 mt-5" style={{ marginTop: 20, width: '100%', marginLeft: 12 }}>
    <KeyboardAvoidingView behavior="padding">
      <ScrollView
        style={{ width: '100%', flexGrow: 1, marginTop: 20, marginLeft: 12 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
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
        <CustomMultiSelect
          placeholder="Select or add tags (optional)"
          value={pageData?.tags}
          onChange={(value) => handleChangePageData(value, VocabularyFieldEnum.Tags)}
          item={tagsList || []}
          title="Tags"
        />
        <CustomURL
          name={VocabularyFieldEnum.URL}
          value={pageData?.[VocabularyFieldEnum.URL]}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.URL].status}
          errorMessage={checkError[VocabularyFieldEnum.URL].message}
        />
        <Spacer height={30} />

        <CustomAccordion title={'Example Sentence And Note (optional)'}>
          {
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
        </CustomAccordion>

        <CustomAccordion title={'Push notification (optional)'}>
          <View>
            <Text>Push notification settings will be implemented here</Text>
          </View>
        </CustomAccordion>

        <Spacer height={20} />

        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
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
        </View>
      </ScrollView>
      <DeleteDialog
        visible={deleteDialogVisible}
        hideDialog={() => setDeleteDialogVisible(false)}
        handleDelete={handleDeleteVocabulary}
      />
    </KeyboardAvoidingView>
    // </ScrollView>
  )
}

export default VocabularySetting
