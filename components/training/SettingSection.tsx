import { KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import CustomInput from '../CustomInput'
import CustomTextArea from '../CustomTextArea'
import CustomDatePicker from '../CustomDatePicker'
import PhotoUploader from '../PhotoUploader'
import ModalFooter from '../ModalFooter'
import { router } from 'expo-router'
import { uploadPhoto } from '@/utils/photos'
import { TrainingFieldEnum } from './type'
import { CheckModalError } from '../learning/type'
import { trainingValidators } from '@/utils/validators'
import LoadingOverlay from '../LoadingOverlay'
import { useDeleteTraining } from '@/lib/trainingAPI'

type SettingSectionProps = {
  handleConfirmApi: (pageData: any) => void
  isEdit?: boolean
  pageData?: any
  isPending?: boolean
}
const initialPageData = {
  sessionNumber: '',
  date: null,
  calories: '',
  duration: '',
  note: '',
  photos: [],
}
const isRequiredFields = [
  TrainingFieldEnum.Date,
  TrainingFieldEnum.Calories,
  TrainingFieldEnum.Duration,
  TrainingFieldEnum.Note,
]

const SettingSection = (props: SettingSectionProps) => {
  const { handleConfirmApi, isEdit = false, pageData: originalPageData, isPending } = props

  const [pageData, setPageData] = useState(initialPageData)
  const { mutateAsync: deleteTraining, isPending: isDeleting } = useDeleteTraining()
  // 清理 Appwrite 文檔數據，移除內部屬性
  const cleanAppwriteData = (data: any) => {
    if (!data) return initialPageData

    return {
      sessionNumber: data.sessionNumber || '',
      date: data.date || null,
      calories: data.calories || '',
      duration: data.duration || '',
      note: data.note || '',
      photos: data.photos || [],
    }
  }

  const [error, setError] = useState({
    [TrainingFieldEnum.SessionNumber]: { status: false, message: '' },
    [TrainingFieldEnum.Date]: { status: false, message: '' },
    [TrainingFieldEnum.Calories]: { status: false, message: '' },
    [TrainingFieldEnum.Duration]: { status: false, message: '' },
    [TrainingFieldEnum.Note]: { status: false, message: '' },
  })

  const handleChange = (value: string | string[] | Date, name: string) => {
    let isError = { status: false, message: '' }
    if (!value && isRequiredFields.includes(name as TrainingFieldEnum)) {
      isError = { status: true, message: '* This is a required field' }
    } else if (trainingValidators[name]) {
      const valid = trainingValidators[name].validate(value as string)
      isError = { status: !valid, message: valid ? '' : trainingValidators[name].message }
    }
    setError((prev) => ({ ...prev, [name]: isError }))

    setPageData((prev) => ({ ...prev, [name]: value }))
  }
  const handleConfirm = (pageData: any) => {
    const newError = {} as CheckModalError
    for (const key in pageData || {}) {
      if (isRequiredFields.includes(key as TrainingFieldEnum) && !pageData[key]) {
        ;(newError as any)[key] = {
          status: true,
          message: '* This is a required field',
        }
      }
    }

    setError((prev) => ({ ...prev, ...newError }))

    // 檢查是否有任何錯誤
    const hasErrors = Object.values({ ...error, ...newError }).some((err) => err.status)

    // 只有在沒有錯誤的情況下才執行 handleSaveData
    if (!hasErrors) {
      handleSaveData()
    }
  }

  const handleSaveData = async () => {
    if (pageData.photos.length > 0) {
      // 分離新上傳的照片（本地 URI）和已存在的照片（Appwrite 文件 ID）
      const newPhotos = pageData.photos.filter(
        (photo: string) => photo.startsWith('file://') || photo.startsWith('content://')
      )
      const existingPhotos = pageData.photos.filter(
        (photo: string) => !photo.startsWith('file://') && !photo.startsWith('content://')
      )

      // 只上傳新的照片
      const newFileIds =
        newPhotos.length > 0
          ? await Promise.all(newPhotos.map((photo: string) => uploadPhoto(photo)))
          : []

      // 合併已存在的照片 ID 和新上傳的照片 ID
      const allFileIds = [...existingPhotos, ...newFileIds]

      await handleConfirmApi({ ...pageData, photos: allFileIds })
      router.back()
    } else {
      await handleConfirmApi(pageData)
      router.back()
    }
  }

  const handleDelete = async () => {
    await deleteTraining(originalPageData.$id)
    router.back()
  }

  useEffect(() => {
    if (originalPageData) {
      setPageData(cleanAppwriteData(originalPageData))
    }
  }, [originalPageData])

  return (
    <KeyboardAvoidingView behavior="padding">
      <ScrollView
        style={{ width: '100%', flexGrow: 1, marginTop: 20, marginLeft: 12 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <LoadingOverlay visible={isPending || false}>
          <CustomInput
            title="SessionNumber"
            placeholder="Session"
            value={pageData.sessionNumber || 'Group'}
            name="sessionNumber"
            onChange={(value) => handleChange(value, 'sessionNumber')}
            error={error[TrainingFieldEnum.SessionNumber].status}
            errorMessage={error[TrainingFieldEnum.SessionNumber].message}
          />
          <CustomDatePicker
            label="Date"
            onConfirm={(date) => handleChange(date, 'date')}
            date={pageData.date}
            error={error[TrainingFieldEnum.Date].status}
            errorMessage={error[TrainingFieldEnum.Date].message}
          />
          <CustomInput
            title="Calories"
            placeholder="Calories"
            value={pageData.calories}
            name="calories"
            onChange={(value) => handleChange(value, 'calories')}
            error={error[TrainingFieldEnum.Calories].status}
            errorMessage={error[TrainingFieldEnum.Calories].message}
          />
          <CustomInput
            title="Duration"
            placeholder="Duration"
            value={pageData.duration}
            name="duration"
            onChange={(value) => handleChange(value, 'duration')}
            error={error[TrainingFieldEnum.Duration].status}
            errorMessage={error[TrainingFieldEnum.Duration].message}
          />
          <CustomTextArea
            title="Note"
            placeholder="Note"
            value={pageData.note}
            name="note"
            onChange={(value) => handleChange(value, 'note')}
            error={error[TrainingFieldEnum.Note].status}
          />
          <PhotoUploader
            photos={pageData.photos}
            setPhotos={(photos) => handleChange(photos, 'photos')}
          />
          <ModalFooter
            confirmText={isEdit ? 'Update' : 'Add'}
            handelConfirm={() => handleConfirm(pageData)}
            isEdit={isEdit}
            handleBack={() => router.back()}
            handleDelete={handleDelete}
            loading={isPending || isDeleting}
          />
        </LoadingOverlay>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SettingSection
