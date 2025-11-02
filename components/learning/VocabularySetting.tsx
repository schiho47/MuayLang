import { ScrollView } from 'react-native'
import React, { useState } from 'react'
import { VocabularyDetailDataType, VocabularyFieldEnum, CheckModalError } from './type'
import ExampleAndNote from './ExampleAndNote'
import { router } from 'expo-router'
import ModalFooter from '../ModalFooter'
import { useAddVocabulary, useUpdateVocabulary } from '../../lib/learningAPI'
import { validators } from '../../utils/validators'

import useGetTagList from '@/hooks/useGetTagList'
import { useUser } from '@/hooks/useUser'

import FormInput from '../ui/input/FormInput'
import URLReader from '../ui/URLReader'
import { Divider } from '@gluestack-ui/themed'
import MultiSelect from '../ui/select/MultiSelect'
import FormAccordion from '../ui/accordion/FormAccordion'
import DeleteModal from '../ui/modal/DeleteModal'
import LoadingOverlay from '../ui/LoadingOverlay'

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
  const { handleBack, pageData, handleChangePageData, isEdit, handleDelete } = props
  const { tagsList, refetch: refetchTags, addLocalTag, clearLocalTags } = useGetTagList()
  const { user } = useUser()

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { mutate: addVocabulary } = useAddVocabulary()
  const { mutate: updateVocabularyMutation } = useUpdateVocabulary()

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
      isError = { status: true, message: 'This is a required field' }
    } else if (validators[name]) {
      const valid = validators[name].validate(value)
      isError = { status: !valid, message: valid ? '' : validators[name].message }
    }

    setCheckError((prev) => ({ ...prev, [name]: isError }))
    handleChangePageData(value, name)
  }

  const handleConfirm = () => {
    const newError = {} as CheckModalError

    // Only check required fields
    isRequiredFields.forEach((field) => {
      if (!pageData[field as keyof VocabularyDetailDataType]) {
        newError[field as CheckErrorKey] = { status: true, message: 'This is a required field' }
      }
    })

    setCheckError((prev) => ({ ...prev, ...newError }))

    // Save data if no errors
    if (Object.keys(newError).length === 0) {
      console.log({ pageData })
      handleSaveData()
    }
  }

  const handleSaveData = () => {
    setIsSaving(true)

    if (isEdit) {
      if (!pageData.$id) {
        console.error('No vocabulary ID provided for update')
        setIsSaving(false)
        return
      }
      console.log('Updating vocabulary with ID:', pageData.$id)
      // Exclude all system fields (fields starting with $)
      const updateData = Object.fromEntries(
        Object.entries(pageData)
          .filter(([key]) => !key.startsWith('$'))
          .filter(([key, value]) => {
            // Filter out URL field if empty
            if (key === 'url' && (!value || value === '')) {
              return false
            }
            return true
          }),
      )
      console.log('📝 Update data:', updateData)
      updateVocabularyMutation(
        { id: pageData.$id, data: updateData },
        {
          onSettled: () => {
            setIsSaving(false)
            // Clear local tags as they're already saved to database
            clearLocalTags()
            // Refetch tag list to ensure newly added tags are displayed
            refetchTags()
            handleBack()
          },
        },
      )
    } else {
      // For creation, also exclude system fields and empty URL, and add userId
      const createData = Object.fromEntries(
        Object.entries(pageData)
          .filter(([key]) => !key.startsWith('$'))
          .filter(([key, value]) => {
            // Filter out URL field if empty
            if (key === 'url' && (!value || value === '')) {
              return false
            }
            return true
          }),
      )

      // Add userId
      const dataWithUserId = {
        ...createData,
        userId: user?.$id,
      }

      console.log('📝 Create data to send:', dataWithUserId)
      console.log('📝 Full pageData:', pageData)
      addVocabulary(dataWithUserId, {
        onSettled: () => {
          setIsSaving(false)
          // Clear local tags as they're already saved to database
          clearLocalTags()
          // Refetch tag list to ensure newly added tags are displayed
          refetchTags()
          handleBack()
        },
      })
    }
  }

  const handleDeleteVocabulary = () => {
    setDeleteDialogVisible(true)
    handleDelete?.()
    handleBack()
  }

  return (
    <>
      <ScrollView
        style={{ width: '100%', flexGrow: 1, marginTop: 20, marginLeft: 12 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput
          title={'Thai'}
          placeholder="Enter Thai"
          value={pageData?.thai}
          name={VocabularyFieldEnum.Thai}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.Thai].status}
          errorMessage={checkError[VocabularyFieldEnum.Thai].message}
        />

        <FormInput
          title={'Romanization'}
          placeholder="Enter Romanization"
          value={pageData?.romanization}
          name={VocabularyFieldEnum.Romanization}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.Romanization].status}
          errorMessage={checkError[VocabularyFieldEnum.Romanization].message}
        />

        <FormInput
          title={'English'}
          placeholder="Enter English"
          value={pageData?.english}
          name={'english'}
          onChange={(value, name) => handleChange(value, name)}
          error={checkError[VocabularyFieldEnum.English].status}
          errorMessage={checkError[VocabularyFieldEnum.English].message}
        />
        <MultiSelect
          placeholder="Select or add tags (optional)"
          value={pageData?.tags}
          onChange={(value) => handleChangePageData(value, VocabularyFieldEnum.Tags)}
          item={tagsList || []}
          title="Tags"
          onAddNewTag={addLocalTag}
        />
        <URLReader
          name={VocabularyFieldEnum.URL}
          value={pageData?.[VocabularyFieldEnum.URL]}
          onChange={(value, name) => handleChange(value, name as VocabularyFieldEnum)}
          error={checkError[VocabularyFieldEnum.URL].status}
          errorMessage={checkError[VocabularyFieldEnum.URL].message}
        />

        <Divider my={28} />

        <FormAccordion
          title={'Example Sentence And Note (optional)'}
          defaultExpanded={!!(pageData?.exampleTH || pageData?.exampleEN || pageData?.note)}
        >
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
        </FormAccordion>

        {/* <FormAccordion title={'Push notification (optional)'}>
          <View>
            <Text>Push notification settings will be implemented here</Text>
          </View>
        </FormAccordion> */}

        <ModalFooter
          handleBack={() => {
            router.back()
          }}
          handelConfirm={handleConfirm}
          isEdit={isEdit}
          handleDelete={() => {
            handleDeleteVocabulary()
          }}
        />
      </ScrollView>
      <DeleteModal
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        handleDelete={handleDeleteVocabulary}
      />

      <LoadingOverlay
        visible={isSaving}
        message={isEdit ? 'Updating vocabulary...' : 'Creating vocabulary...'}
      />
    </>
  )
}

export default VocabularySetting
